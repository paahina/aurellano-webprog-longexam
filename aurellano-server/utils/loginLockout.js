const attempts = new Map();

const normalizeEmail = (email) => (email ? String(email).toLowerCase().trim() : "");

const getDelayMs = (failedCount) => {
  if (failedCount >= 10) return 30 * 60 * 1000;
  if (failedCount >= 8) return 5 * 60 * 1000;
  if (failedCount >= 5) return 3 * 60 * 1000;
  return 0;
};

const checkLoginAllowed = (email) => {
  const key = normalizeEmail(email);
  if (!key) return { allowed: true };

  const record = attempts.get(key);
  if (!record) return { allowed: true };

  const delayMs = getDelayMs(record.failedCount);
  if (delayMs === 0) return { allowed: true, failedCount: record.failedCount };

  const elapsed = Date.now() - record.lastAttemptAt;
  if (elapsed < delayMs) {
    const retryAfterSeconds = Math.ceil((delayMs - elapsed) / 1000);
    return {
      allowed: false,
      failedCount: record.failedCount,
      retryAfterSeconds,
      delayMinutes: Math.ceil(delayMs / 60000),
    };
  }

  return { allowed: true, failedCount: record.failedCount };
};

const recordFailedLogin = (email) => {
  const key = normalizeEmail(email);
  if (!key) return 0;

  const record = attempts.get(key) || { failedCount: 0, lastAttemptAt: 0 };
  record.failedCount += 1;
  record.lastAttemptAt = Date.now();
  attempts.set(key, record);
  return record.failedCount;
};

const clearLoginAttempts = (email) => {
  attempts.delete(normalizeEmail(email));
};

module.exports = {
  checkLoginAllowed,
  recordFailedLogin,
  clearLoginAttempts,
  getDelayMs,
};
