import mongoose, { Document, Schema } from "mongoose";

interface ITransaction extends Document {
  type: string;
  amount: number;
  date: Date;
  userId: mongoose.Types.ObjectId;
  txn_id?: string;
}

const TransactionSchema: Schema<ITransaction> = new Schema<ITransaction>({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  txn_id: { type: String, required: false },
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);

export default Transaction;
