module.exports = {
    create: `
        INSERT INTO applicants(
            phone_number, amount, first_name, last_name, state, lga, state_of_residence, 
            lga_of_residence, bank_name, bank_account_number, programme_id
        ) VALUES (
            $[phone_number], $[amount], $[first_name], $[last_name], $[state], $[lga],
            $[state_of_residence], $[lga_of_residence], $[bank_name], $[bank_account_number], $[programme_id]
        ) RETURNING *
    `
}