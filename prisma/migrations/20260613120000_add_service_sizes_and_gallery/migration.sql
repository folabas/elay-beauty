-- Add pricingTier to Service
ALTER TABLE "Service" ADD COLUMN "pricingTier" TEXT;

-- Add selectedSize to Booking
ALTER TABLE "Booking" ADD COLUMN "selectedSize" TEXT;

-- Create GalleryImage table
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);
