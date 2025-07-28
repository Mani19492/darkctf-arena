-- Add phone number to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone_number TEXT;

-- Update the handle_new_user function to include phone number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, email, phone_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'username', 
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number'
  );
  RETURN NEW;
END;
$function$;

-- Create function to add new admin users
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email TEXT,
  user_username TEXT,
  user_phone TEXT
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into profiles as admin
  INSERT INTO public.profiles (id, username, email, phone_number, is_admin)
  VALUES (gen_random_uuid(), user_username, user_email, user_phone, true)
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy to only allow admin users to authenticate
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;