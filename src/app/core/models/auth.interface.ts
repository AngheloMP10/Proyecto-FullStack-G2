export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  tempToken?: string;
  tipoToken?: string;
  username?: string;
  role?: string;
  requires2FA: boolean;
}

export interface QrResponse {
  secret: string;
  qrUrl: string;
}
