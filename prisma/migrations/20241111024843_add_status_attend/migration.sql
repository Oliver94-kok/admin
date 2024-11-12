/*
  Warnings:

  - The values [NotActive] on the enum `Attends_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `day` on the `salary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attends` MODIFY `status` ENUM('Active', 'Full_Attend', 'No_ClockIn', 'Absent', 'Leave') NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE `salary` DROP COLUMN `day`;
