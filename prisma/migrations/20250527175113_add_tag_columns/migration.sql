-- AlterTable
ALTER TABLE "Tag" ADD COLUMN "userId" TEXT,
ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- DropIndex
DROP INDEX "Tag_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_userId_key" ON "Tag"("name", "userId"); 