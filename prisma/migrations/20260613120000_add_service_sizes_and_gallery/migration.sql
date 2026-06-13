-- Add pricingTier to Service (if not already present from db push)
DO $$ BEGIN
  ALTER TABLE "Service" ADD COLUMN "pricingTier" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add selectedSize to Booking (if not already present from db push)
DO $$ BEGIN
  ALTER TABLE "Booking" ADD COLUMN "selectedSize" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Create GalleryImage table
CREATE TABLE IF NOT EXISTS "GalleryImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);
