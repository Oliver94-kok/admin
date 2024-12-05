-- AlterTable
ALTER TABLE `Attends` MODIFY `status` ENUM('Active', 'Full_Attend', 'No_ClockIn_ClockOut', 'Absent', 'Leave', 'Late', 'OffDay') NOT NULL DEFAULT 'Active';
