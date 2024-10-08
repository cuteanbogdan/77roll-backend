import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  username: string;
  balance: number;
  clientSeed: string;
  level: number;
  experience: number;
  profileImage: string;
  rank: string;
  totalBets: number;
  totalBetRoulette: number;
  totalBetCoinflip: number;
  xpToNextLevel: number;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    balance: { type: Number, default: 0 },
    clientSeed: { type: String, required: false },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    profileImage: { type: String, default: "" },
    rank: { type: String, default: "Rookie" },
    totalBets: { type: Number, default: 0 },
    totalBetRoulette: { type: Number, default: 0 },
    totalBetCoinflip: { type: Number, default: 0 },
    xpToNextLevel: { type: Number, default: 100 },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
