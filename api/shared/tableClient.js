const { TableClient } = require("@azure/data-tables");

const TABLE_NAME = "submissions";

let cachedClient = null;

/**
 * Returns a TableClient connected to the "submissions" table, creating the
 * table on first use if it doesn't exist yet.
 */
async function getTableClient() {
  if (cachedClient) return cachedClient;

  const connectionString = process.env.TABLE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error(
      "TABLE_CONNECTION_STRING app setting is missing. Set it with `az staticwebapp appsettings set`."
    );
  }

  const client = TableClient.fromConnectionString(connectionString, TABLE_NAME, {
    allowInsecureConnection: connectionString.includes("UseDevelopmentStorage=true"),
  });

  try {
    await client.createTable();
  } catch (err) {
    // 409 = table already exists, which is fine.
    if (err.statusCode !== 409) throw err;
  }

  cachedClient = client;
  return cachedClient;
}

module.exports = { getTableClient, TABLE_NAME };
