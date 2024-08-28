import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  text: string;
  timestamp: string;
}

const ChatMessageSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
});

export default mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
