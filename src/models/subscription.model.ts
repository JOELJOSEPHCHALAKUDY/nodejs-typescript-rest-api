import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { ISubscription } from "./../interfaces/subscription";

const Schema = mongoose.Schema;

//create a schema
const subscriptionSchema = new Schema<ISubscription>({
  type: {
    type: String,
    enum: ["monthly", "anually"],
    default: "monthly",
  },
  active: {
    type: Boolean,
    default: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "account",
    required: true,
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

//create model
export default mongoose.model<ISubscription>(
  "subscription",
  subscriptionSchema
);
