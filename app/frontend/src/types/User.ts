export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  sharedWith: string[]; // IDs of users this user has shared with
}