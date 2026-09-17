const { checkLoginAllowed } = require("../utils/loginLockout");

const loginLockoutMiddleware = (req, res, next) => {
  const check = checkLoginAllowed(req.body?.email);
  if (!check.allowed) {
    return res.status(429).json({
      message: `Too many failed login attempts (${check.failedCount}). Wait ${check.delayMinutes} minute(s) before trying again.`,
      retryAfterSeconds: check.retryAfterSeconds,
      failedAttempts: check.failedCount,
    });
  }
  next();
};

module.exports = loginLockoutMiddleware;
