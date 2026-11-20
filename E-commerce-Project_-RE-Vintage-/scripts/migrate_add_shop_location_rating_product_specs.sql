-- Migration: add shop.location, shop.rating, product.specs
-- Run once against vinyl_db after updating the backend models.
-- Safe to run multiple times (uses IF NOT EXISTS / column existence checks).

DO $$
BEGIN
  -- shops.location
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'location'
  ) THEN
    ALTER TABLE shops ADD COLUMN location VARCHAR(200);
  END IF;

  -- shops.rating
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'rating'
  ) THEN
    ALTER TABLE shops ADD COLUMN rating FLOAT;
  END IF;

  -- products.specs
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'specs'
  ) THEN
    ALTER TABLE products ADD COLUMN specs TEXT;
  END IF;
END $$;
