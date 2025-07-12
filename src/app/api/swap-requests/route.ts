import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SwapRequest from '@/models/SwapRequest';
import Item from '@/models/Item';
import User from '@/models/User';

// GET /api/swap-requests - Get swap requests with filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const requesterId = searchParams.get('requesterId');
    const itemId = searchParams.get('itemId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};
    
    if (status) query.status = status;
    if (userId) {
      // Get items owned by this user
      const userItems = await Item.find({ userId }).distinct('_id');
      query.itemId = { $in: userItems };
    }
    if (requesterId) query.requesterId = requesterId;
    if (itemId) query.itemId = itemId;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const swapRequests = await SwapRequest.find(query)
      .populate('requesterId', 'name avatar stats.rating')
      .populate('itemId', 'title images points category')
      .populate('offeredItemId', 'title images points category')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await SwapRequest.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: swapRequests,
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
    console.error('Error fetching swap requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch swap requests' },
      { status: 500 }
    );
  }
}

// POST /api/swap-requests - Create a new swap request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      requesterId,
      itemId,
      offeredItemId,
      message,
      requesterMessage,
      pointsOffered,
      pointsRequested,
      swapType,
      meetingLocation,
      meetingDate,
    } = body;

    // Validate required fields
    if (!requesterId || !itemId || !swapType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate swap type requirements
    if (swapType === 'item_for_item' && !offeredItemId) {
      return NextResponse.json(
        { success: false, message: 'Offered item is required for item-for-item swaps' },
        { status: 400 }
      );
    }

    if (swapType === 'item_for_points' && (!pointsOffered || pointsOffered <= 0)) {
      return NextResponse.json(
        { success: false, message: 'Points offered must be greater than 0 for item-for-points swaps' },
        { status: 400 }
      );
    }

    if (swapType === 'points_for_item' && (!pointsRequested || pointsRequested <= 0)) {
      return NextResponse.json(
        { success: false, message: 'Points requested must be greater than 0 for points-for-item swaps' },
        { status: 400 }
      );
    }

    // Check if requester and item exist
    const [requester, item] = await Promise.all([
      User.findById(requesterId),
      Item.findById(itemId)
    ]);

    if (!requester) {
      return NextResponse.json(
        { success: false, message: 'Requester not found' },
        { status: 404 }
      );
    }

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if item is available
    if (item.status !== 'available') {
      return NextResponse.json(
        { success: false, message: 'Item is not available for swapping' },
        { status: 400 }
      );
    }

    // Check if requester is not the item owner
    if (item.userId.toString() === requesterId) {
      return NextResponse.json(
        { success: false, message: 'Cannot swap your own item' },
        { status: 400 }
      );
    }

    // Check if user has sufficient points for points-based swaps
    if (swapType === 'item_for_points' || swapType === 'mixed') {
      if (requester.points < (pointsOffered || 0)) {
        return NextResponse.json(
          { success: false, message: 'Insufficient points' },
          { status: 400 }
        );
      }
    }

    // Check if offered item exists and belongs to requester (for item swaps)
    if (offeredItemId) {
      const offeredItem = await Item.findById(offeredItemId);
      if (!offeredItem) {
        return NextResponse.json(
          { success: false, message: 'Offered item not found' },
          { status: 404 }
        );
      }

      if (offeredItem.userId.toString() !== requesterId) {
        return NextResponse.json(
          { success: false, message: 'Offered item does not belong to requester' },
          { status: 400 }
        );
      }

      if (offeredItem.status !== 'available') {
        return NextResponse.json(
          { success: false, message: 'Offered item is not available' },
          { status: 400 }
        );
      }
    }

    // Check for existing pending swap request
    const existingRequest = await SwapRequest.findOne({
      requesterId,
      itemId,
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: 'You already have a pending swap request for this item' },
        { status: 400 }
      );
    }

    // Create the swap request
    const swapRequest = new SwapRequest({
      requesterId,
      itemId,
      offeredItemId,
      message,
      requesterMessage,
      pointsOffered: pointsOffered || 0,
      pointsRequested: pointsRequested || 0,
      swapType,
      meetingLocation,
      meetingDate: meetingDate ? new Date(meetingDate) : undefined,
    });

    await swapRequest.save();

    // Update item status to pending_swap
    await Item.findByIdAndUpdate(itemId, { status: 'pending_swap' });

    // Populate the response
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requesterId', 'name avatar stats.rating')
      .populate('itemId', 'title images points category')
      .populate('offeredItemId', 'title images points category')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Swap request created successfully',
      data: populatedRequest,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating swap request:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create swap request' },
      { status: 500 }
    );
  }
} 