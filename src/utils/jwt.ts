import jwt from "jsonwebtoken";

export const generateToken = (userId: string): string => {
  if (!process.env.JWTSecretKey) {
    throw new Error("JWTSecretKey is not defined");
  }

  const token = jwt.sign(
    { user: { id: userId } },
    process.env.JWTSecretKey as string,
    { expiresIn: "24h" }
  );

  return token;
};
