-- Add display name and avatar URL columns to the profiles table to allow customization
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS avatar_url text;
