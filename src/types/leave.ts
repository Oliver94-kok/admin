export interface LeavesInterface {
  id: string;
  userId: string;
  reason: string;
  type: string;
  startDate: Date;
  endDate: Date;
  status: string;
  img: string | null;
  users: {
    name: string;
    username: string;
    userImg: string | null;
    AttendBranch: { team: string } | null;
  } | null;
}
