/**
 * Build MongoDB search query
 * @param {string} searchTerm - Search term
 * @param {array} searchFields - Fields to search in
 * @returns {object} - MongoDB query object
 */
export const buildSearchQuery = (searchTerm, searchFields = []) => {
  if (!searchTerm || searchFields.length === 0) {
    return {};
  }

  const searchRegex = { $regex: searchTerm, $options: 'i' };
  return {
    $or: searchFields.map((field) => ({
      [field]: searchRegex,
    })),
  };
};

/**
 * Build MongoDB filter query
 * @param {object} filters - Filter object
 * @param {array} validFields - Valid filter fields
 * @returns {object} - MongoDB query object
 */
export const buildFilterQuery = (filters = {}, validFields = []) => {
  const query = {};

  validFields.forEach((field) => {
    if (filters[field] !== undefined && filters[field] !== null && filters[field] !== '') {
      query[field] = filters[field];
    }
  });

  return query;
};

/**
 * Build date range query
 * @param {string} fromDate - Start date (ISO format)
 * @param {string} toDate - End date (ISO format)
 * @param {string} dateField - Field name to query
 * @returns {object} - MongoDB query object
 */
export const buildDateRangeQuery = (fromDate, toDate, dateField = 'createdAt') => {
  const query = {};

  if (fromDate && toDate) {
    query[dateField] = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  } else if (fromDate) {
    query[dateField] = { $gte: new Date(fromDate) };
  } else if (toDate) {
    query[dateField] = { $lte: new Date(toDate) };
  }

  return query;
};

/**
 * Combine multiple query objects
 * @param {...object} queries - Query objects to combine
 * @returns {object} - Combined query object
 */
export const combineQueries = (...queries) => {
  return Object.assign({}, ...queries.filter((q) => Object.keys(q).length > 0));
};
