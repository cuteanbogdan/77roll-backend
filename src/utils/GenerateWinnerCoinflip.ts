import crypto from "crypto";

interface DetermineOutcomeResult {
  outcome: "heads" | "tails";
  winnerId: string;
}

export const determineCoinflipOutcome = (
  roomSeed: string,
  creatorClientSeed: string,
  opponentClientSeed: string,
  roomId: string,
  creatorChoice: "heads" | "tails",
  creatorId: string,
  opponentId: string
): DetermineOutcomeResult => {
  const combinedSeed = `${roomSeed}:${creatorClientSeed}:${opponentClientSeed}:${roomId}`;

  // Generate SHA-256 hash from the combined seed
  const hash = crypto.createHash("sha256").update(combinedSeed).digest("hex");

  // Convert the first 8 characters of the hash to a decimal number
  const decimalValue = parseInt(hash.substring(0, 8), 16);

  const outcome = decimalValue % 2 === 0 ? "heads" : "tails";
  const winnerId = creatorChoice === outcome ? creatorId : opponentId;

  return { outcome, winnerId };
};
