import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return null;
    
    const decoded = verifyToken(token);
    if (!decoded) return null;
    
    // In a real app, you'd fetch the user from the database
    // For now, we'll return the decoded token data
    return decoded as User;
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(token: string) {
  // This would be handled in the API route
  return token;
} 