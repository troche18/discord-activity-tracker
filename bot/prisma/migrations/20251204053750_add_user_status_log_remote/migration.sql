-- CreateTable
CREATE TABLE "UserStatusLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserStatusLog_userId_idx" ON "UserStatusLog"("userId");
