-- First delete existing admin users and create new one
DELETE FROM public.profiles WHERE is_admin = true;

-- Create new admin user
INSERT INTO public.profiles (id, username, email, phone_number, is_admin)
VALUES (gen_random_uuid(), 'ctfadmin', 'admin@admin.com', '+1234567890', true);