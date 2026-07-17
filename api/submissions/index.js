const { v4: uuidv4 } = require("uuid");
const { getTableClient } = require("../shared/tableClient");

const REQUIRED_FIELDS = ["fullName", "email", "department"];

module.exports = async function (context, req) {
  try {
    if (req.method === "POST") {
      return await handleCreate(context, req);
    }
    if (req.method === "GET") {
      return await handleList(context, req);
    }
    context.res = { status: 405, body: { error: "Method not allowed" } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: "Internal server error" } };
  }
};

async function handleCreate(context, req) {
  const payload = req.body || {};

  const missing = REQUIRED_FIELDS.filter((f) => !payload[f] || !String(payload[f]).trim());
  const hasSkill = Array.isArray(payload.skills) && payload.skills.some((s) => s?.name?.trim());
  if (missing.length || !hasSkill) {
    context.res = {
      status: 400,
      body: { error: "Missing required fields or at least one skill." },
    };
    return;
  }

  const id = uuidv4();
  const client = await getTableClient();

  await client.createEntity({
    partitionKey: "submission",
    rowKey: id,
    fullName: payload.fullName,
    employeeId: payload.employeeId || "",
    email: payload.email,
    department: payload.department, // Client/Project Name
    jobTitle: payload.jobTitle || "",
    location: payload.location || "",
    availability: payload.availability || "",
    certifications: payload.certifications || "",
    notes: payload.notes || "",
    skillsJson: JSON.stringify(payload.skills || []),
    submittedAt: new Date().toISOString(),
  });

  context.res = { status: 201, body: { id } };
}

async function handleList(context, req) {
  const suppliedPassword = req.headers["x-admin-password"];
  if (!suppliedPassword || suppliedPassword !== process.env.ADMIN_PASSWORD) {
    context.res = { status: 401, body: { error: "Unauthorized" } };
    return;
  }

  const client = await getTableClient();
  const entities = [];
  for await (const entity of client.listEntities({
    queryOptions: { filter: `PartitionKey eq 'submission'` },
  })) {
    entities.push({
      id: entity.rowKey,
      fullName: entity.fullName,
      employeeId: entity.employeeId,
      email: entity.email,
      department: entity.department,
      jobTitle: entity.jobTitle,
      location: entity.location,
      availability: entity.availability,
      certifications: entity.certifications,
      notes: entity.notes,
      skills: JSON.parse(entity.skillsJson || "[]"),
      submittedAt: entity.submittedAt,
    });
  }

  entities.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: entities,
  };
}
