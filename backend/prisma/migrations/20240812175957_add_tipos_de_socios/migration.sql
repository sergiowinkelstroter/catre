-- CreateEnum
CREATE TYPE "MembershipType" AS ENUM ('INDIVIDUAL', 'FAMILIA');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "membershipType" "MembershipType";
