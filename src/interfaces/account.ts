import mongoose, { Document } from "mongoose";

export interface IAccount extends Document {
  name: string;
  avatar: string;
  username: string;
  email: string;
  password: string;
  active: boolean;
  is_deleted: boolean;
  is_suspened: boolean;
  otp?: number;
  otp_expired_at?: Date;
  created_at: Date;
  updated_at: Date;

  isValidPassword(newPassword: string): Promise<boolean>;
}
