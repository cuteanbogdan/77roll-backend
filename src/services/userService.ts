import Transaction from "../models/Transaction";
import User from "../models/User";

// Fetch user by ID
export const findUserById = async (userId: string) => {
  try {
    const user = await User.findById(userId).select("-password");
    return user;
  } catch (error) {
    throw new Error("User not found");
  }
};

export const updateUserLevelAndRank = async (
  userId: string,
  additionalXP: number
) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.experience += additionalXP;

    // Calculate the XP required for the next level
    let xpRequiredForNextLevel = 100 * Math.pow(user.level, 1.5);

    // Level up logic
    while (user.experience >= xpRequiredForNextLevel) {
      user.experience -= xpRequiredForNextLevel;
      user.level += 1;
      xpRequiredForNextLevel = 100 * Math.pow(user.level, 1.5);
    }

    user.xpToNextLevel = xpRequiredForNextLevel - user.experience;

    // Update rank based on the level
    if (user.level >= 51) {
      user.rank = "Legend";
    } else if (user.level >= 31) {
      user.rank = "Master";
    } else if (user.level >= 21) {
      user.rank = "Expert";
    } else if (user.level >= 11) {
      user.rank = "Veteran";
    } else if (user.level >= 6) {
      user.rank = "Apprentice";
    } else {
      user.rank = "Rookie";
    }

    await user.save();
  } catch (error) {
    throw new Error("Error updating user level and rank: " + error);
  }
};

export const updateUserBalance = async (
  userId: string,
  amount: number,
  txn_id?: string
): Promise<void> => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      userId: user._id,
      type: `Deposit`,
      amount: amount,
      date: new Date(),
      txn_id: txn_id || null,
    });
    await transaction.save();
  } catch (error) {
    console.error("Error updating user balance:", error);
    throw new Error("Failed to update user balance");
  }
};
