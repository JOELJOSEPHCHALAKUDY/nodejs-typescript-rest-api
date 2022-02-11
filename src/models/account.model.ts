import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { IAccount } from "./../interfaces/account";

const Schema = mongoose.Schema;

//create a schema
const accountSchema = new Schema<IAccount>({
  name: {
    type: String,
    default: "",
    required: false,
  },
  avatar: {
    type: String,
    default: "",
    required: false,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  is_deleted: {
    type: Boolean,
    default: false,
  },
  is_suspened: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: Number,
    default: null,
    required: false,
  },
  otp_expired_at: {
    type: Date,
    default: null,
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

accountSchema.methods.isValidPassword = async function (newPassword: string) {
  try {
    //compare
    return await bcrypt.compare(newPassword, this.password);
  } catch (error: any) {
    throw new Error(error);
  }
};

//create model
export default mongoose.model<IAccount>("account", accountSchema);
