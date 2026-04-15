-- Insert initial users
INSERT INTO lunch_users (id, name, created_at) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Shafqat', '2024-01-01'),
  ('a2222222-2222-2222-2222-222222222222', 'Usama', '2024-01-01'),
  ('a3333333-3333-3333-3333-333333333333', 'Shahabaz', '2024-01-01')
ON CONFLICT (id) DO NOTHING;

-- Insert lunch entries
INSERT INTO lunch_entries (id, date, total_expense) VALUES
  ('e1111111-1111-1111-1111-111111111111', '2024-03-01', 450),
  ('e2222222-2222-2222-2222-222222222222', '2024-03-04', 520),
  ('e3333333-3333-3333-3333-333333333333', '2024-03-05', 380),
  ('e4444444-4444-4444-4444-444444444444', '2024-03-06', 600),
  ('e5555555-5555-5555-5555-555555555555', '2024-03-07', 480),
  ('e6666666-6666-6666-6666-666666666666', '2024-03-08', 550),
  ('e7777777-7777-7777-7777-777777777777', '2024-03-11', 420),
  ('e8888888-8888-8888-8888-888888888888', '2024-03-12', 390),
  ('e9999999-9999-9999-9999-999999999999', '2024-03-13', 0),
  ('eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-03-14', 510)
ON CONFLICT (id) DO NOTHING;

-- Insert shares for entry 1 (450 total, split equally)
INSERT INTO lunch_shares (entry_id, user_id, share_amount) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 150),
  ('e1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 150),
  ('e1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 150)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert payments for entry 1 (Shafqat paid)
INSERT INTO lunch_payments (entry_id, user_id, paid_amount) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 450)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert shares for entry 2 (520 total)
INSERT INTO lunch_shares (entry_id, user_id, share_amount) VALUES
  ('e2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 173),
  ('e2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 173),
  ('e2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 174)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert payments for entry 2 (Usama paid)
INSERT INTO lunch_payments (entry_id, user_id, paid_amount) VALUES
  ('e2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 520)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert shares for entry 3 (380 total)
INSERT INTO lunch_shares (entry_id, user_id, share_amount) VALUES
  ('e3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 127),
  ('e3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 127),
  ('e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 126)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert payments for entry 3 (Shahabaz paid)
INSERT INTO lunch_payments (entry_id, user_id, paid_amount) VALUES
  ('e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 380)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert shares for entry 4 (600 total)
INSERT INTO lunch_shares (entry_id, user_id, share_amount) VALUES
  ('e4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 200),
  ('e4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 200),
  ('e4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 200)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert payments for entry 4 (Shafqat paid)
INSERT INTO lunch_payments (entry_id, user_id, paid_amount) VALUES
  ('e4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 600)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert shares for entry 5 (480 total)
INSERT INTO lunch_shares (entry_id, user_id, share_amount) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 160),
  ('e5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 160),
  ('e5555555-5555-5555-5555-555555555555', 'a3333333-3333-3333-3333-333333333333', 160)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert payments for entry 5 (Usama paid)
INSERT INTO lunch_payments (entry_id, user_id, paid_amount) VALUES
  ('e5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 480)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert shares for entry 6 (550 total)
INSERT INTO lunch_shares (entry_id, user_id, share_amount) VALUES
  ('e6666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 183),
  ('e6666666-6666-6666-6666-666666666666', 'a2222222-2222-2222-2222-222222222222', 184),
  ('e6666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', 183)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert payments for entry 6 (Shahabaz paid)
INSERT INTO lunch_payments (entry_id, user_id, paid_amount) VALUES
  ('e6666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', 550)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert shares for entry 7 (420 total)
INSERT INTO lunch_shares (entry_id, user_id, share_amount) VALUES
  ('e7777777-7777-7777-7777-777777777777', 'a1111111-1111-1111-1111-111111111111', 140),
  ('e7777777-7777-7777-7777-777777777777', 'a2222222-2222-2222-2222-222222222222', 140),
  ('e7777777-7777-7777-7777-777777777777', 'a3333333-3333-3333-3333-333333333333', 140)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert payments for entry 7 (Shafqat paid)
INSERT INTO lunch_payments (entry_id, user_id, paid_amount) VALUES
  ('e7777777-7777-7777-7777-777777777777', 'a1111111-1111-1111-1111-111111111111', 420)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert shares for entry 8 (390 total)
INSERT INTO lunch_shares (entry_id, user_id, share_amount) VALUES
  ('e8888888-8888-8888-8888-888888888888', 'a1111111-1111-1111-1111-111111111111', 130),
  ('e8888888-8888-8888-8888-888888888888', 'a2222222-2222-2222-2222-222222222222', 130),
  ('e8888888-8888-8888-8888-888888888888', 'a3333333-3333-3333-3333-333333333333', 130)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert payments for entry 8 (Usama paid)
INSERT INTO lunch_payments (entry_id, user_id, paid_amount) VALUES
  ('e8888888-8888-8888-8888-888888888888', 'a2222222-2222-2222-2222-222222222222', 390)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Entry 9 has zero expense (no shares or payments needed)

-- Insert shares for entry 10 (510 total)
INSERT INTO lunch_shares (entry_id, user_id, share_amount) VALUES
  ('eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1111111-1111-1111-1111-111111111111', 170),
  ('eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a2222222-2222-2222-2222-222222222222', 170),
  ('eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a3333333-3333-3333-3333-333333333333', 170)
ON CONFLICT (entry_id, user_id) DO NOTHING;

-- Insert payments for entry 10 (Shahabaz paid)
INSERT INTO lunch_payments (entry_id, user_id, paid_amount) VALUES
  ('eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a3333333-3333-3333-3333-333333333333', 510)
ON CONFLICT (entry_id, user_id) DO NOTHING;
