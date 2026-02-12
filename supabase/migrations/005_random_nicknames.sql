-- ============================================================
-- Replace handle_new_user to assign a random fun nickname
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
declare
  adjectives text[] := ARRAY[
    'Hungry', 'Speedy', 'Mighty', 'Sneaky', 'Lucky',
    'Cosmic', 'Turbo', 'Spicy', 'Crispy', 'Golden',
    'Chill', 'Epic', 'Mega', 'Super', 'Ultra',
    'Blazing', 'Frosted', 'Savage', 'Noble', 'Daring'
  ];
  nouns text[] := ARRAY[
    'General', 'Waffle', 'Burrito', 'Falcon', 'Panther',
    'Nugget', 'Taco', 'Pretzel', 'Muffin', 'Biscuit',
    'Noodle', 'Pickle', 'Donut', 'Cookie', 'Nacho',
    'Churro', 'Bagel', 'Crouton', 'Pepper', 'Truffle'
  ];
  random_name text;
begin
  random_name := adjectives[1 + floor(random() * array_length(adjectives, 1))::int]
    || nouns[1 + floor(random() * array_length(nouns, 1))::int]
    || floor(random() * 1000)::int::text;

  insert into public.profiles (id, email, name)
  values (new.id, new.email, random_name);
  return new;
end;
$$ language plpgsql security definer set search_path = public;
