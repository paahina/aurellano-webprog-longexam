const parseSortKey = (sort) => {
  if (!sort) return { key: null, descending: false };
  const descending = sort.startsWith("-");
  return { key: descending ? sort.slice(1) : sort, descending };
};

const buildDateSort = (sort, dateField = "createdAt", defaultDescending = true) => {
  const { key, descending } = parseSortKey(sort);
  if (!key || key === "createdAt") {
    return { [dateField]: key && !descending ? 1 : defaultDescending ? -1 : 1 };
  }
  return { [dateField]: defaultDescending ? -1 : 1 };
};

const buildUserSort = (sort) => {
  const { key, descending } = parseSortKey(sort);
  const direction = descending ? -1 : 1;
  if (!key || key === "name") {
    return { lastName: direction, firstName: direction };
  }
  if (key === "createdAt") {
    return { createdAt: direction };
  }
  return { lastName: 1, firstName: 1 };
};

module.exports = {
  parseSortKey,
  buildDateSort,
  buildUserSort,
};
