import {UserRole} from './UserRole';

export interface User{
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
