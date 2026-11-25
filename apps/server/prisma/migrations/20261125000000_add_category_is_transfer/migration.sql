-- AlterTable
ALTER TABLE "Category" ADD COLUMN "is_transfer" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: until now the transfer category was recognised by its seeded name
UPDATE "Category" SET "is_transfer" = true WHERE "name" = 'Internal Transfer';
