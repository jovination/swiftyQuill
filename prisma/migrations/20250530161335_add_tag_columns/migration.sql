/*
  Warnings:

  - You are about to drop the column `isDefault` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Tag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- DropIndex
DROP INDEX "Tag_name_userId_key";

-- DropIndex
DROP INDEX "Tag_userId_idx";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "isDefault",
DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
