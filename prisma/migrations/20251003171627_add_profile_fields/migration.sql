-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "githubUsername" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "phone" TEXT;
