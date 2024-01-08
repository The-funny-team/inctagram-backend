export type RefreshJwtPayload = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
};
