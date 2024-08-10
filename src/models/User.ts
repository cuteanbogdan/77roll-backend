import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  username: string;
  balance: number;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
