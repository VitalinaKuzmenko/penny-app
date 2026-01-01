/*
  Warnings:

  - You are about to drop the column `created_id` on the `TransactionImport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TransactionImport" DROP COLUMN "created_id",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
