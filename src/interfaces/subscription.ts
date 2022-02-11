import mongoose, { Document } from "mongoose";

export interface ISubscription extends Document {
  type: string;
  active: boolean;
  account?: string;
  created_at: Date;
  updated_at: Date;
}
