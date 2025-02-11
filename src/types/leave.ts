export interface LeavesInterface {
  id: string;
  userId: string;
  reason: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  img: string | null;
  branch: string | null;
  users: {
    name: string;
    username: string;
    userImg: string | null;
    AttendBranch: { team: string; branch: string | null } | null;
  } | null;
}

export const leaveType = [
  "Paid leave",
  "Medical leave (MC)",
  "Bereavement leave",
  "Annual leave",
];

export const fullLeaveTypes = [
  "Paid leave",
  "Unpaid leave",
  "Emergency leave",
  "Bereavement leave",
  "Medical leave (MC)",
  "Annual leave",
  "Forget clock",
  "Delivery late",
];
