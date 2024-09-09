import mongoose, { Document, Schema } from "mongoose";

interface ICoinflipRoom extends Document {
  creatorId: mongoose.Schema.Types.ObjectId;
  opponentId?: mongoose.Schema.Types.ObjectId;
  creatorChoice: "heads" | "tails";
  opponentChoice?: "heads" | "tails";
  betAmount: number;
  result?: "heads" | "tails";
  status: "waiting" | "playing" | "finished";
}

const CoinflipRoomSchema: Schema<ICoinflipRoom> = new Schema({
  creatorId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  opponentId: { type: Schema.Types.ObjectId, ref: "User" },
  creatorChoice: { type: String, enum: ["heads", "tails"], required: true },
  opponentChoice: { type: String, enum: ["heads", "tails"] },
  betAmount: { type: Number, required: true },
  result: { type: String, enum: ["heads", "tails"] },
  status: {
    type: String,
    enum: ["waiting", "playing", "finished"],
    default: "waiting",
  },
});

const CoinflipRoom = mongoose.model<ICoinflipRoom>(
  "CoinflipRoom",
  CoinflipRoomSchema
);
export default CoinflipRoom;
