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
  'Cuti bergaji',
  '带薪假',
  "Medical leave (MC)",
  'Cuti sakit (MC)',
  '病假 (MC)',
  "Bereavement leave",
  '丧假',
  'Cuti berkabung',
  "Annual leave",
  'Cuti tahunan',
  '年假',
  "Delivery late",
  'Penghantaran lewat',
  '载送延迟',
];

export const fullLeaveTypes = [
  "Paid leave",
  'Cuti bergaji',
  '带薪假',
  "Unpaid leave",
  'Cuti tanpa gaji',
  '无薪假',
  "Emergency leave",
  '紧急假',
  'Cuti sakit (MC)',
  "Bereavement leave",
  'Cuti berkabung',
  '丧假',
  "Medical leave (MC)",
  '病假 (MC)',
  "Annual leave",
  'Cuti tahunan',
  '年假',
  "Forget clock",
  'Lupa clock',
  '忘记打卡',
  "Delivery late",
  'Penghantaran lewat',
  '载送延迟',
];
