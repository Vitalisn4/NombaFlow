export type JwtTokenType = 'access' | 'refresh';

export type MerchantJwtPayload = {
  sub: string;
  email: string;
  type: JwtTokenType;
};

export type AuthenticatedMerchant = {
  merchantId: string;
  email: string;
};
