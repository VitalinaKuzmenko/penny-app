-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionTag" (
    "transaction_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "TransactionTag_pkey" PRIMARY KEY ("transaction_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_user_id_name_key" ON "Tag"("user_id", "name");

-- CreateIndex
CREATE INDEX "TransactionTag_tag_id_idx" ON "TransactionTag"("tag_id");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTag" ADD CONSTRAINT "TransactionTag_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionTag" ADD CONSTRAINT "TransactionTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

