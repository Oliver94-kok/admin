/*
  Warnings:

  - The values [No_ClockOut,No_ClockIn] on the enum `Attends_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [MANAGER] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Attends` MODIFY `status` ENUM('Active', 'Full_Attend', 'No_ClockIn_ClockOut', 'Absent', 'Leave', 'Late') NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'USER', 'MANAGER_A', 'MANAGER_B', 'MANAGER_C', 'MANAGER_D') NOT NULL DEFAULT 'USER';
