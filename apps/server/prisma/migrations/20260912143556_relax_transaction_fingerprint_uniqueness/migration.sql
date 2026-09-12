-- DropIndex
DROP INDEX "Transaction_account_id_fingerprint_key";

-- CreateIndex
CREATE INDEX "Transaction_account_id_fingerprint_idx" ON "Transaction"("account_id", "fingerprint");
