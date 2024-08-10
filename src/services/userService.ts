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
