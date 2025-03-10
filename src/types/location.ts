export interface location{
    id: string,
    addressIn: string,
    addressOut?: string,
    userId: string,
    branch: string,
    type: string,
    timeIn: Date,
    timeOut: Date,
    status: string,
    users: {
        username: string;
        name: string;
        userImg: string;
      }
}