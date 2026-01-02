-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- AlterTable
ALTER TABLE "TransactionImport" ADD COLUMN     "status" "ImportStatus" NOT NULL DEFAULT 'PENDING';
