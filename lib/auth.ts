import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const API_KEY = process.env.APP_API_KEY;

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
  };
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function authenticateRequest(request: NextRequest): boolean {
  // Check for API key in headers
  const apiKey = request.headers.get('x-api-key');
  if (apiKey && apiKey === API_KEY) {
    return true;
  }

  // Check for JWT token
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      verifyToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  return false;
}

export function extractUserFromRequest(request: NextRequest): any {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      return verifyToken(token);
    } catch (error) {
      return null;
    }
  }
  return null;
}
