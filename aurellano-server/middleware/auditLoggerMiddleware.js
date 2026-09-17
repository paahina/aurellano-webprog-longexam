const Log = require("../models/logModel");

const logger = {
  info: async (message, metadata = {}) => {
    try {
      await Log.create({ level: "info", message, metadata });
    } catch (error) {
      console.error("Failed to write info log:", error.message);
    }
  },

  warn: async (message, metadata = {}) => {
    try {
      await Log.create({ level: "warn", message, metadata });
    } catch (error) {
      console.error("Failed to write warn log:", error.message);
    }
  },

  error: async (message, metadata = {}) => {
    try {
      await Log.create({ level: "error", message, metadata });
    } catch (error) {
      console.error("Failed to write error log:", error.message);
    }
  },
};

const auditLoggerMiddleware = async (request, response, next) => {
  const startTime = Date.now();
  let logged = false;

  const writeAuditLog = () => {
    if (logged) return;
    logged = true;

    const duration = Date.now() - startTime;
    const logData = {
      method: request.method,
      path: request.originalUrl || request.path,
      ip: request.ip || request.socket?.remoteAddress,
      userId: request.user?.id || null,
      email: request.user?.email || null,
      userRole: request.user?.userRole || null,
      statusCode: response.statusCode,
      metadata: { duration: `${duration}ms` },
    };

    const message = `${logData.method} ${logData.path} - ${logData.statusCode}`;
    if (response.statusCode >= 500) {
      logger.error(message, logData);
    } else if (response.statusCode >= 400) {
      logger.warn(message, logData);
    } else {
      logger.info(message, logData);
    }
  };

  const originalSend = response.send;
  response.send = function (data) {
    response.send = originalSend;
    writeAuditLog();
    return response.send(data);
  };

  response.on("finish", writeAuditLog);

  next();
};

module.exports = { logger, auditLoggerMiddleware };
