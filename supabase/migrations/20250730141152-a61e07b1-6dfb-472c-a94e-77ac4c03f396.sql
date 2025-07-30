-- Create a new admin user with unique credentials
INSERT INTO public.profiles (id, username, email, phone_number, is_admin)
VALUES (gen_random_uuid(), 'ctfadmin', 'admin@admin.com', '+1234567890', true)
ON CONFLICT (email) DO UPDATE SET 
  username = 'ctfadmin',
  is_admin = true;