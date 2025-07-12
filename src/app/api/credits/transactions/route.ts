import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build query
    const query: any = { userId: user._id };
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('metadata.itemId', 'title images')
      .populate('metadata.swapRequestId', 'status')
      .populate('metadata.relatedUserId', 'name email');
    
    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    
    // Get transaction statistics
    const stats = await Transaction.getUserStats(user._id);
    
    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      stats: stats[0] || {
        totalTransactions: 0,
        totalPurchased: 0,
        totalDeducted: 0,
        totalBonus: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
} 