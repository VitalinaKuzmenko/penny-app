/*
  Warnings:

  - You are about to drop the column `accountId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `account_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropIndex
DROP INDEX "Transaction_accountId_date_idx";

-- DropIndex
DROP INDEX "Transaction_categoryId_date_idx";

-- DropIndex
DROP INDEX "Transaction_userId_date_idx";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "accountId",
DROP COLUMN "categoryId",
DROP COLUMN "userId",
ADD COLUMN     "account_id" TEXT NOT NULL,
ADD COLUMN     "category_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TransactionImportRow" (
    "id" TEXT NOT NULL,
    "import_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category_id" TEXT,

    CONSTRAINT "TransactionImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionImport" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_id" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_user_id_date_idx" ON "Transaction"("user_id", "date");

-- CreateIndex
CREATE INDEX "Transaction_account_id_date_idx" ON "Transaction"("account_id", "date");

-- CreateIndex
CREATE INDEX "Transaction_category_id_date_idx" ON "Transaction"("category_id", "date");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionImportRow" ADD CONSTRAINT "TransactionImportRow_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "TransactionImport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
