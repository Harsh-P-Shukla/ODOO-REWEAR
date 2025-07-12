import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';

export async function GET(request: NextRequest) {
  try {
    // Require admin role
    await requireRole(request, ['admin']);
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get items with pagination and populate user info
    const items = await Item.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count
    const total = await Item.countDocuments(query);
    
    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin items error:', error);
    
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
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
} 