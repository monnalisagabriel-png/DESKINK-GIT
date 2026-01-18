-- List the 10 most recent users to check if registration worked
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
