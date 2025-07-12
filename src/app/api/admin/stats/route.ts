import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Item from '@/models/Item';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireRole(request, ['admin']);
    await dbConnect();
    
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          totalPoints: { $sum: '$points' },
          avgRating: { $avg: '$stats.rating' },
        }
      }
    ]);

    // Get item statistics
    const itemStats = await Item.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          availableItems: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          swappedItems: { $sum: { $cond: [{ $eq: ['$status', 'swapped'] }, 1, 0] } },
          totalPoints: { $sum: '$points' },
        }
      }
    ]);

    // Get transaction statistics
    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalPurchased: { $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, '$amount', 0] } },
          totalDeducted: { $sum: { $cond: [{ $eq: ['$type', 'deduction'] }, '$amount', 0] } },
        }
      }
    ]);

    const stats = {
      totalUsers: userStats[0]?.totalUsers || 0,
      activeUsers: userStats[0]?.activeUsers || 0,
      totalItems: itemStats[0]?.totalItems || 0,
      pendingItems: itemStats[0]?.availableItems || 0,
      totalTransactions: transactionStats[0]?.totalTransactions || 0,
      totalRevenue: Math.round((transactionStats[0]?.totalPurchased || 0) * 0.1), // 10% commission
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Admin stats error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (error.message === 'Insufficient permissions') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
} 