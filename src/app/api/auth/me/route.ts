import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('type amount description status createdAt');
    
    // Get transaction stats
    const transactionStats = await Transaction.getUserStats(user._id);
    
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        points: user.points,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        stats: user.stats,
        level: user.level,
        preferences: user.preferences,
        verification: user.verification,
        social: user.social,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
      recentTransactions,
      transactionStats: transactionStats[0] || {
        totalTransactions: 0,
        totalPurchased: 0,
        totalDeducted: 0,
        totalBonus: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
      }
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 