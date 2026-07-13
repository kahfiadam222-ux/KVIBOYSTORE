-- Add cover URL column to profiles table for profile banners
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cover_url text;
