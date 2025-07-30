-- Update existing user to admin status
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'spmteja09@gmail.com';

-- Check if spmteja20@gmail.com exists, if not it will be created through auth signup
-- We'll set admin status for this email when the user signs up