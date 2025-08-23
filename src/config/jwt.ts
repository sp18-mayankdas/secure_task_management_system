import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env?.JWT_SECRET || 'SECRET';
export const JWT_EXPIRES_IN = process.env?.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  if (!JWT_SECRET || JWT_SECRET === '') {
    throw new Error('JWT_SECRET is not configured');
  }
  return (jwt as any).sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return (jwt as any).verify(token, JWT_SECRET as jwt.Secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};