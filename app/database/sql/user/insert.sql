INSERT INTO ${schema~}.user (first_name, last_name, email_address)
VALUES ($1, $2, $3)
RETURNING id