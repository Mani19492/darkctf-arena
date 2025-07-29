-- Update existing user to admin status
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'spmteja09@gmail.com';

-- Insert new admin user if not exists
INSERT INTO public.profiles (id, username, email, phone_number, is_admin)
VALUES (
  gen_random_uuid(), 
  'spmteja20', 
  'spmteja20@gmail.com', 
  '+1234567890', 
  true
) 
ON CONFLICT (email) DO UPDATE SET 
  is_admin = true,
  username = EXCLUDED.username;

-- Note: The password will need to be set through Supabase Auth when the user signs up