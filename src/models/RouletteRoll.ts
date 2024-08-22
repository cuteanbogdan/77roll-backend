import mongoose, { Document, Schema } from "mongoose";

interface IRouletteRoll extends Document {
  winningNumber: number;
  winningColor: "black" | "red" | "green";
  serverSeed: string;
  roundNumber: number;
  timestamp: Date;
}

const RouletteRollSchema: Schema<IRouletteRoll> = new Schema({
  winningNumber: { type: Number, required: true },
  winningColor: {
    type: String,
    enum: ["black", "red", "green"],
    required: true,
  },
  serverSeed: { type: String, required: true },
  roundNumber: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const RouletteRoll = mongoose.model<IRouletteRoll>(
  "RouletteRoll",
  RouletteRollSchema
);

RouletteRollSchema.index({ timestamp: 1 });

export default RouletteRoll;
