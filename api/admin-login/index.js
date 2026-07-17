module.exports = async function (context, req) {
  context.log("admin-login function invoked");
  try {
    const { password } = req.body || {};

    if (!process.env.ADMIN_PASSWORD) {
      context.log.error("ADMIN_PASSWORD app setting is not configured.");
      context.res = { status: 500, body: { error: "Admin login is not configured." } };
      return;
    }

    if (password && password === process.env.ADMIN_PASSWORD) {
      context.res = { status: 200, body: { ok: true } };
    } else {
      context.res = { status: 401, body: { ok: false } };
    }
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: "Internal server error", detail: err.message } };
  }
};
