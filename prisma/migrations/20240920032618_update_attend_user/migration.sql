/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `AttendBranch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AttendBranch_userId_key` ON `AttendBranch`(`userId`);
