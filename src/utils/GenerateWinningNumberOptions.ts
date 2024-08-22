import crypto from "crypto";

interface GenerateWinningNumberOptions {
  serverSeed: string;
  clientSeeds: string[];
  roundNumber: number;
  maxNumber?: number;
}

export const generateWinningNumber = ({
  serverSeed,
  clientSeeds,
  roundNumber,
  maxNumber = 14,
}: GenerateWinningNumberOptions): number => {
  // Combine the serverSeed, clientSeeds, and roundNumber (nonce)
  const combinedSeed = `${serverSeed}:${clientSeeds.join(":")}:${roundNumber}`;
  const hash = crypto.createHash("sha256").update(combinedSeed).digest("hex");

  // Convert the first 8 characters of the hash to a decimal number
  const decimalValue = parseInt(hash.substring(0, 8), 16);

  // Calculate the winning number directly within the range
  const winningNumber = decimalValue % (maxNumber + 1);

  return winningNumber;
};
