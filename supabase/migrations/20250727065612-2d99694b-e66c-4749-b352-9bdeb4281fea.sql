-- Update the user with email spmteja09@gmail.com to be an admin
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'spmteja09@gmail.com';

-- Also create a function to easily make users admin by email (for future use)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.profiles 
  SET is_admin = true 
  WHERE email = user_email;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;