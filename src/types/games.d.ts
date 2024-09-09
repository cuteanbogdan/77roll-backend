export interface CoinflipRoomType {
  _id: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  opponentId?: mongoose.Types.ObjectId;
  creatorChoice: "heads" | "tails";
  opponentChoice?: "heads" | "tails";
  betAmount: number;
  result?: "heads" | "tails";
  status: "waiting" | "playing" | "finished";
}
