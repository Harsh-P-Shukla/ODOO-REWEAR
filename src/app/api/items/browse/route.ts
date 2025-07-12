import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = { status: 'available' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (condition && condition !== 'all') {
      query.condition = condition;
    }

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sort: any = {};
    if (sortBy === 'points') {
      sort.points = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = sortOrder === 'desc' ? -1 : 1;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const items = await Item.find(query)
      .populate('userId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Item.countDocuments(query);

    // Transform items to match frontend structure
    const transformedItems = items.map(item => ({
      id: item._id.toString(),
      title: item.title,
      description: item.description,
      images: item.images,
      points: item.points,
      category: item.category,
      type: item.type,
      size: item.size,
      condition: item.condition,
      brand: item.brand || 'Unknown',
      location: item.location || 'Unknown',
      status: item.status || 'available',
      seller: {
        name: item.userId?.name || 'Unknown',
        email: item.userId?.email || 'unknown@example.com',
      },
      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: transformedItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching browse items:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch items' },
      { status: 500 }
    );
  }
} 