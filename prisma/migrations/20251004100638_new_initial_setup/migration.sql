/*
  Warnings:

  - You are about to drop the column `userId` on the `VerificationToken` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."VerificationToken" DROP CONSTRAINT "VerificationToken_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "public"."VerificationToken" DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "VerificationToken_identifier_idx" ON "public"."VerificationToken"("identifier");
