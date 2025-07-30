-- Update existing admin users with new credentials
UPDATE public.profiles 
SET email = 'admin@admin.com', username = 'admin'
WHERE email IN ('spmteja09@gmail.com', 'spmteja20@gmail.com');

-- Also update in auth.users if needed
UPDATE auth.users 
SET email = 'admin@admin.com'
WHERE email IN ('spmteja09@gmail.com', 'spmteja20@gmail.com');