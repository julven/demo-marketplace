-- Seed listings (matches SEED_LISTINGS in lib/data.js)
INSERT INTO listings (title, price, category, location, seller_email, description, created_at) VALUES
  (
    'Bike 24 inch',
    99.00,
    'Sporting Goods',
    'Palo Alto, CA',
    'jordan.lee@example.com',
    'Kids'' 24" mountain bike, 21 speeds. Tires recently replaced.',
    NOW() - INTERVAL '1 hour'
  ),
  (
    'Wooden dining table',
    180.00,
    'Home Goods',
    'Mountain View, CA',
    'sam.patel@example.com',
    'Solid oak table, seats six. A few light scratches.',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'Acoustic guitar',
    140.00,
    'Musical Instruments',
    'Menlo Park, CA',
    'chris.morgan@example.com',
    'Full-size acoustic with soft case and spare strings.',
    NOW() - INTERVAL '5 hours'
  ),
  (
    '27" monitor',
    120.00,
    'Electronics',
    'Palo Alto, CA',
    'alex.kim@example.com',
    '1440p, HDMI and DisplayPort. Works perfectly.',
    NOW() - INTERVAL '8 hours'
  ),
  (
    'Office chair',
    75.00,
    'Office Supplies',
    'Sunnyvale, CA',
    'taylor.nguyen@example.com',
    'Adjustable mesh office chair with lumbar support.',
    NOW() - INTERVAL '12 hours'
  ),
  (
    'Board game bundle',
    40.00,
    'Toys & Games',
    'Los Altos, CA',
    'jamie.rivera@example.com',
    'Five family board games, all pieces included.',
    NOW() - INTERVAL '20 hours'
  ),
  (
    '2012 Honda Civic',
    6500.00,
    'Vehicles',
    'San Jose, CA',
    'morgan.davis@example.com',
    '128k miles, clean title, new brakes.',
    NOW() - INTERVAL '26 hours'
  ),
  (
    'Patio set',
    0.00,
    'Free Stuff',
    'Palo Alto, CA',
    'riley.chen@example.com',
    'Free patio table and four chairs. Must pick up.',
    NOW() - INTERVAL '30 hours'
  ),
  (
    'Dog crate (large)',
    35.00,
    'Pet Supplies',
    'Redwood City, CA',
    'casey.brooks@example.com',
    'Folding metal crate with divider and tray.',
    NOW() - INTERVAL '40 hours'
  ),
  (
    'Winter jacket',
    45.00,
    'Apparel',
    'Palo Alto, CA',
    'drew.wilson@example.com',
    'Men''s size M, waterproof, worn one season.',
    NOW() - INTERVAL '50 hours'
  );
