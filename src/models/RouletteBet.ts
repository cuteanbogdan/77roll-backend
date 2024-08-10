import mongoose, { Document, Schema } from "mongoose";

interface IRouletteBet extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  color: "black" | "red" | "green";
  amount: number;
}

const RouletteBetSchema: Schema<IRouletteBet> = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  color: { type: String, enum: ["black", "red", "green"], required: true },
  amount: { type: Number, required: true },
});

const RouletteBet = mongoose.model<IRouletteBet>(
  "RouletteBet",
  RouletteBetSchema
);
export default RouletteBet;
