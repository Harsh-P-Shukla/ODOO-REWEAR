import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import dbConnect from './db';
import User from '@/models/User';
import { User as UserType } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(user: UserType): string {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      points: user.points
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

export async function getCurrentUser(): Promise<UserType | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return null;
    
    const decoded = verifyToken(token);
    if (!decoded) return null;
    
    // Fetch fresh user data from database
    await dbConnect();
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) return null;
    
    return user.toObject();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<UserType> {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new Error('Invalid token');
  }
  
  await dbConnect();
  const user = await User.findById(decoded.id).select('-password');
  
  if (!user || !user.isActive) {
    throw new Error('User not found or inactive');
  }
  
  return user.toObject();
}

export async function requireRole(request: NextRequest, roles: string[]): Promise<UserType> {
  const user = await requireAuth(request);
  
  if (!roles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}

export function setAuthCookie(token: string) {
  return token;
}

export async function updateUserLastActive(userId: string): Promise<void> {
  try {
    await dbConnect();
    await User.findByIdAndUpdate(userId, { lastActive: new Date() });
  } catch (error) {
    console.error('Error updating user last active:', error);
  }
}

export async function getUserWithStats(userId: string) {
  await dbConnect();
  return User.findById(userId)
    .select('-password')
    .populate({
      path: 'stats',
      select: 'itemsListed itemsSwapped totalSwaps rating reviews'
    });
}

export async function deductUserPoints(userId: string, amount: number, reason: string) {
  await dbConnect();
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.points < amount) {
    throw new Error('Insufficient points');
  }
  
  const balanceBefore = user.points;
  user.points -= amount;
  await user.save();
  
  // Create transaction record
  const Transaction = (await import('@/models/Transaction')).default;
  await Transaction.create({
    userId,
    type: 'deduction',
    amount,
    description: reason,
    status: 'completed',
    balanceBefore,
    balanceAfter: user.points,
  });
  
  return user;
}

export async function addUserPoints(userId: string, amount: number, reason: string, type: 'purchase' | 'bonus' | 'refund' = 'bonus') {
  await dbConnect();
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const balanceBefore = user.points;
  user.points += amount;
  await user.save();
  
  // Create transaction record
  const Transaction = (await import('@/models/Transaction')).default;
  await Transaction.create({
    userId,
    type,
    amount,
    description: reason,
    status: 'completed',
    balanceBefore,
    balanceAfter: user.points,
  });
  
  return user;
} 