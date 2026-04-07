-- ==============================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO SEED
-- CATEGORIES AND BRANDS
-- ==============================================

-- 1. Insert Brands
INSERT INTO brands (name, logo_url, is_visible) VALUES 
('Optimum Nutrition', 'https://placehold.co/120x60/161616/888888?text=ON', true),
('Biotech USA', 'https://placehold.co/120x60/161616/888888?text=BIOTECH', true),
('Applied Nutrition', 'https://placehold.co/120x60/161616/888888?text=APPLIED', true),
('Dymatize', 'https://placehold.co/120x60/161616/888888?text=DYMATIZE', true),
('MuscleTech', 'https://placehold.co/120x60/161616/888888?text=MUSCLETECH', true),
('Nutrex', 'https://placehold.co/120x60/161616/888888?text=NUTREX', true),
('OstroVit', 'https://placehold.co/120x60/161616/888888?text=OSTROVIT', true),
('Rule One', 'https://placehold.co/120x60/161616/888888?text=R1', true);

-- 2. Insert Categories
INSERT INTO categories (name, slug, image_url) VALUES 
('Build Mass', 'build-mass', 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=400&q=80'),
('Burn Fat', 'burn-fat', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'),
('Boost Performance', 'boost-performance', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80'),
('Recover & Protect', 'recover-protect', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80'),
('Pre-workout', 'pre-workout', 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=400&q=80'),
('Vitamines', 'vitamines', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80'),
('Snacks', 'snacks', 'https://images.unsplash.com/photo-1621643950478-f29e1eb16086?w=400&q=80'),
('Boisson', 'boisson', 'https://images.unsplash.com/photo-1527960471264-9326ef312c5b?w=400&q=80');

