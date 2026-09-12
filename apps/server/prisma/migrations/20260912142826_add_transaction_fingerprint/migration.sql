/*
  Warnings:

  - A unique constraint covering the columns `[account_id,fingerprint]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "fingerprint" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_account_id_fingerprint_key" ON "Transaction"("account_id", "fingerprint");
