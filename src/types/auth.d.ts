export interface JwtPayload {
  user: { id: string };
  iat: number;
  exp: number;
}
