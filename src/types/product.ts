export type Salary = {
  image: string;
  name: string;
  username: string;
  bday: number;
  ot: number;
  totalday: number;
  late: number;
  totalsal: number;
};

export type Product = {
  image: string;
  name: string;
  username: string;
  category: string;
  price: number;
  sold: number;
  active: number;
  confirm: number;
};

export type Leave = {
  image: string;
  name: string;
  username: string;
  branch: string;
  leavetype:string;
  leavedate: string;
  leavereason: string;
  leaveimage: string;
};

export type Branch = {
  image: string;
  name: string;
  username: string;
  branches: string;
  setclockin: string;
  setclockout: string;
  starton: string;
};

export type Invoice = {
  name: string;
  username: string;
  branches: string;
  workinghours: number;
  bday: number;
  ot: number;
  totalday: number;
  late: number;
  totalsal: number;
  allowance: number;
};