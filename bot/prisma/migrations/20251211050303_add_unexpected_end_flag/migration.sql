-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "isUnexpectedEnd" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserStatusLog" ADD COLUMN     "isUnexpectedEnd" BOOLEAN NOT NULL DEFAULT false;
