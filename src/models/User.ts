import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  username: string;
  balance: number;
  level: number;
  experience: number;
  profileImage: string;
  rank: string;
  totalBets: number;
  totalBetRoulette: number;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    balance: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    profileImage: { type: String, default: "" },
    rank: { type: String, default: "Rookie" },
    totalBets: { type: Number, default: 0 },
    totalBetRoulette: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
