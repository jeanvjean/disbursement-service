module.exports = {
    create: `INSERT INTO cash_bands(amount, programme_id) VALUES($[amount], $[programme_id])`,
    all: `SELECT amount FROM cash_bands WHERE deleted_at IS NULL`,
    fetchBandByAmount: `SELECT * FROM cash_bands WHERE amount = $[amount] AND programme_id = $[programme_id] LIMIT 1`,
}