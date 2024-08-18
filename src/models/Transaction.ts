import mongoose, { Document, Schema } from "mongoose";

interface ITransaction extends Document {
  type: string;
  amount: number;
  date: Date;
  userId: mongoose.Types.ObjectId;
}

const TransactionSchema: Schema<ITransaction> = new Schema<ITransaction>({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);

export default Transaction;
