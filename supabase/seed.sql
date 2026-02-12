-- Seed data: fake members + interactions for demo
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================================
-- 1. Create auth users (triggers auto-create profiles)
-- ============================================================
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
VALUES
  ('a0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'jthompson25@mail.wlu.edu',  crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'mrodriguez26@mail.wlu.edu', crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'ewilson25@mail.wlu.edu',    crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'scarroll27@mail.wlu.edu',   crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'dkim26@mail.wlu.edu',       crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'apatel28@mail.wlu.edu',     crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'jnguyen25@mail.wlu.edu',    crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'cjohnson27@mail.wlu.edu',   crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'lbrown26@mail.wlu.edu',     crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'rgarcia28@mail.wlu.edu',    crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'klee25@mail.wlu.edu',       crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated'),
  ('a0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'twhite26@mail.wlu.edu',     crypt('password123', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Update profiles with names, ratings, completed counts
-- ============================================================
UPDATE profiles SET name = 'SwipeMaster3000',    rating_avg = 4.8, completed_count = 32, cancel_count = 1 WHERE id = 'a0000001-0000-0000-0000-000000000001';
UPDATE profiles SET name = 'BurritoQueen99',     rating_avg = 4.9, completed_count = 28, cancel_count = 0 WHERE id = 'a0000001-0000-0000-0000-000000000002';
UPDATE profiles SET name = 'HungryGeneral',      rating_avg = 4.6, completed_count = 21, cancel_count = 2 WHERE id = 'a0000001-0000-0000-0000-000000000003';
UPDATE profiles SET name = 'CafeCrusader',       rating_avg = 4.7, completed_count = 18, cancel_count = 1 WHERE id = 'a0000001-0000-0000-0000-000000000004';
UPDATE profiles SET name = 'TenderDefender',     rating_avg = 5.0, completed_count = 15, cancel_count = 0 WHERE id = 'a0000001-0000-0000-0000-000000000005';
UPDATE profiles SET name = 'NachoAverage',       rating_avg = 4.5, completed_count = 12, cancel_count = 1 WHERE id = 'a0000001-0000-0000-0000-000000000006';
UPDATE profiles SET name = 'FryLord420',         rating_avg = 4.3, completed_count = 9,  cancel_count = 3 WHERE id = 'a0000001-0000-0000-0000-000000000007';
UPDATE profiles SET name = 'GrillzNChillz',      rating_avg = 4.8, completed_count = 7,  cancel_count = 0 WHERE id = 'a0000001-0000-0000-0000-000000000008';
UPDATE profiles SET name = 'QuesadillaKing',     rating_avg = 4.4, completed_count = 5,  cancel_count = 1 WHERE id = 'a0000001-0000-0000-0000-000000000009';
UPDATE profiles SET name = 'SoupSurgeon',        rating_avg = 4.1, completed_count = 3,  cancel_count = 2 WHERE id = 'a0000001-0000-0000-0000-000000000010';
UPDATE profiles SET name = 'MealDealMaverick',   rating_avg = 4.6, completed_count = 2,  cancel_count = 0 WHERE id = 'a0000001-0000-0000-0000-000000000011';
UPDATE profiles SET name = 'SnackAttack007',     rating_avg = 3.9, completed_count = 1,  cancel_count = 1 WHERE id = 'a0000001-0000-0000-0000-000000000012';

-- ============================================================
-- 3. Create active posts (swipes available right now)
-- ============================================================
INSERT INTO posts (id, seller_id, status, capacity_total, capacity_remaining, location, notes)
VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'open', 3, 2, 'Cafe 77', null),
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'open', 2, 2, 'Cafe 77', null),
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000004', 'open', 4, 3, 'Cafe 77', null),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000005', 'open', 1, 1, 'Cafe 77', null),
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000006', 'open', 5, 4, 'Cafe 77', null),
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000009', 'open', 2, 1, 'Cafe 77', null);

-- ============================================================
-- 4. Create requests at various statuses (active interactions)
-- ============================================================

-- Request on Jake's post: Ethan requested, Jake accepted, in progress
INSERT INTO requests (id, post_id, buyer_id, seller_id, status, items_text, instructions, est_total)
VALUES (
  'c0000001-0000-0000-0000-000000000001',
  'b0000001-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000003',
  'a0000001-0000-0000-0000-000000000001',
  'accepted',
  '1x Cheeseburger ($8.50)
1x Crinkle Cut Fries ($3.00)',
  'No pickles please',
  11.50
);

-- Request on Sarah's post: James requested, pending
INSERT INTO requests (id, post_id, buyer_id, seller_id, status, items_text, est_total)
VALUES (
  'c0000001-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000003',
  'a0000001-0000-0000-0000-000000000007',
  'a0000001-0000-0000-0000-000000000004',
  'requested',
  '1x Chicken Tenders ($7.50)
1x Waffle Fries ($4.00)',
  11.50
);

-- Request on Ananya's post: Caroline requested, accepted, ordered
INSERT INTO requests (id, post_id, buyer_id, seller_id, status, items_text, instructions, est_total)
VALUES (
  'c0000001-0000-0000-0000-000000000003',
  'b0000001-0000-0000-0000-000000000005',
  'a0000001-0000-0000-0000-000000000008',
  'a0000001-0000-0000-0000-000000000006',
  'ordered',
  '1x Grilled Chicken Sandwich ($7.50)
1x Fountain Drink ($1.75)',
  'Extra sauce on the side',
  9.25
);

-- Request on Maria's post: Kevin requested, pending
INSERT INTO requests (id, post_id, buyer_id, seller_id, status, items_text, est_total)
VALUES (
  'c0000001-0000-0000-0000-000000000004',
  'b0000001-0000-0000-0000-000000000002',
  'a0000001-0000-0000-0000-000000000011',
  'a0000001-0000-0000-0000-000000000002',
  'requested',
  '1x Breakfast Burrito ($6.00)
1x Drip Coffee ($2.25)',
  8.25
);

-- Request on Lucas's post: Taylor requested, accepted
INSERT INTO requests (id, post_id, buyer_id, seller_id, status, items_text, est_total)
VALUES (
  'c0000001-0000-0000-0000-000000000005',
  'b0000001-0000-0000-0000-000000000006',
  'a0000001-0000-0000-0000-000000000012',
  'a0000001-0000-0000-0000-000000000009',
  'accepted',
  '1x Black Bean Quesadilla ($7.00)
1x Mozzarella Sticks ($6.00)',
  null
);

-- Completed request: Daniel shared, Rosa requested — done
INSERT INTO requests (id, post_id, buyer_id, seller_id, status, items_text, est_total, created_at, updated_at)
VALUES (
  'c0000001-0000-0000-0000-000000000006',
  'b0000001-0000-0000-0000-000000000004',
  'a0000001-0000-0000-0000-000000000010',
  'a0000001-0000-0000-0000-000000000005',
  'completed',
  '1x Hamburger ($8.00)
1x Soup ($4.00)',
  12.00,
  now() - interval '2 hours',
  now() - interval '1 hour'
);

-- ============================================================
-- 5. Ratings on the completed request
-- ============================================================
INSERT INTO ratings (request_id, rater_id, ratee_id, stars, comment)
VALUES
  ('c0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000005', 5, 'Super fast, thank you!'),
  ('c0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000010', 4, 'Good communication');

-- ============================================================
-- 6. Some chat messages on active requests
-- ============================================================
INSERT INTO messages (request_id, sender_id, body, created_at)
VALUES
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'Hey! Can you order soon? I have class at 1', now() - interval '15 minutes'),
  ('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Heading to Cafe 77 now!', now() - interval '10 minutes'),
  ('c0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000008', 'Thank you so much!! I''ll be at the Co-op in 10', now() - interval '5 minutes'),
  ('c0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000006', 'Order is in, should be ready in a few', now() - interval '3 minutes');
