module.exports = {
  paginate: ({ limit, offset }) => `
    LIMIT ${limit} OFFSET ${offset}
  `,
  interval: (period, tableAlias = '') => `
    AND ${tableAlias}created_at >= CURRENT_TIMESTAMP - INTERVAL '${period} days' 
    `,
  filterColumn: (key, column, connector = '=') => `
    AND ${key} ${connector} '${column}'
  `,
  whereIn: (column) => (
    `AND ${column} IN ($[arr:csv])`
  ),
  whereInWhere: (column) => (
    `WHERE ${column} IN ($[arr:csv])`
  ),
  sortColumn: (column, sort, tableAlias = '') => `
    ORDER BY ${tableAlias}${column} ${sort} 
  `,
  limit: (limit) => `
    LIMIT ${limit}
  `,
  search: (field, value) => `
    AND ${field} LIKE '%${value}%'
  `,
  dateRange: (start_date, end_date,tableAlias) => `
    WHERE ${tableAlias}.created_at >= '${start_date}' AND ${tableAlias}.created_at <= '${end_date}'
  `,
  dateRangeAnd: (start_date, end_date,tableAlias) => `
    AND ${tableAlias}.created_at >= '${start_date}' AND ${tableAlias}.created_at <= '${end_date}'
  `,
  skipSoftDelete: (tableAlias = '') => `
    AND ${tableAlias}deleted_at IS NULL
  `,
  skipSoftDeleteWhere: (tableAlias = '') => `
    WHERE ${tableAlias}deleted_at IS NULL
  `,
  groupBy: (column) => `
    GROUP BY ${column}
  `
};
