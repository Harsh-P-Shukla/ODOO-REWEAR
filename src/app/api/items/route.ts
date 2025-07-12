import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import User from '@/models/User';

// GET /api/items - Get all items with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'available';
    const minPoints = searchParams.get('minPoints');
    const maxPoints = searchParams.get('maxPoints');
    const condition = searchParams.get('condition');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const userId = searchParams.get('userId');
    const featured = searchParams.get('featured');

    // Build query
    const query: any = { status };
    
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (userId) query.userId = userId;
    if (featured === 'true') query.featured = true;
    
    if (minPoints || maxPoints) {
      query.points = {};
      if (minPoints) query.points.$gte = parseInt(minPoints);
      if (maxPoints) query.points.$lte = parseInt(maxPoints);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const items = await Item.find(query)
      .populate('userId', 'name avatar stats.rating')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Item.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      title,
      description,
      category,
      subcategory,
      brand,
      type,
      size,
      color,
      condition,
      tags,
      images,
      points,
      location,
      userId,
    } = body;

    // Validate required fields
    if (!title || !description || !category || !type || !size || !condition || !images || !points || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate points
    if (points < 1 || points > 10000) {
      return NextResponse.json(
        { success: false, message: 'Points must be between 1 and 10000' },
        { status: 400 }
      );
    }

    // Check if user exists and has sufficient points
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Create the item
    const item = new Item({
      title,
      description,
      category,
      subcategory,
      brand,
      type,
      size,
      color,
      condition,
      tags: tags || [],
      images,
      points,
      location,
      userId,
    });

    await item.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.itemsListed': 1 }
    });

    // Populate user info for response
    const populatedItem = await Item.findById(item._id)
      .populate('userId', 'name avatar stats.rating')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Item created successfully',
      data: populatedItem,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create item' },
      { status: 500 }
    );
  }
} 