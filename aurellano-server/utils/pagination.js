const parsePagination = (query, { defaultLimit = 10 } = {}) => {
  const requested = query.page !== undefined || query.limit !== undefined;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || defaultLimit);
  const skip = (page - 1) * limit;
  return { requested, page, limit, skip };
};

const paginatedResponse = ({ data, total, page, limit }) => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

module.exports = {
  parsePagination,
  paginatedResponse,
};
