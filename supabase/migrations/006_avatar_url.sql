-- Add avatar_url column to profiles for AI-generated avatars
alter table profiles add column if not exists avatar_url text;
