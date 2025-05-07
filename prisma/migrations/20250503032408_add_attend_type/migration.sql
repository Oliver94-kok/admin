-- AlterTable
ALTER TABLE `Attends` MODIFY `status` ENUM('Active', 'Full_Attend', 'No_ClockIn_ClockOut', 'Absent', 'Leave', 'Late', 'OffDay', 'Half_Day') NOT NULL DEFAULT 'Active';
