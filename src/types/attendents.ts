export interface AttendsInterface {
  id: string;
  clockIn: Date;
  clockOut: Date;
  workingHour: number;
  img: string;
  userId: string;
  locationIn: string;
  locationOut: string;
  fine: number;
  fine2: number;
  team: string;
  users: {
    username: string;
    name: string;
    userImg: string;
    AttendBranch: {
      team: string;
    };
  };
}
