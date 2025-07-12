import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SwapRequest from '@/models/SwapRequest';
import Item from '@/models/Item';
import User from '@/models/User';

// GET /api/swap-requests/[id] - Get a specific swap request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Swap request ID is required' },
        { status: 400 }
      );
    }

    const swapRequest = await SwapRequest.findById(id)
      .populate('requesterId', 'name avatar bio stats.rating location')
      .populate('itemId', 'title images points category userId')
      .populate('offeredItemId', 'title images points category userId')
      .lean();

    if (!swapRequest) {
      return NextResponse.json(
        { success: false, message: 'Swap request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: swapRequest,
    });
  } catch (error) {
    console.error('Error fetching swap request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch swap request' },
      { status: 500 }
    );
  }
}

// PUT /api/swap-requests/[id] - Update a swap request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    const { action, userId, message, rating, review } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Swap request ID is required' },
        { status: 400 }
      );
    }

    const swapRequest = await SwapRequest.findById(id)
      .populate('itemId')
      .populate('offeredItemId');

    if (!swapRequest) {
      return NextResponse.json(
        { success: false, message: 'Swap request not found' },
        { status: 404 }
      );
    }

    // Get the item to check ownership
    const item = await Item.findById(swapRequest.itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'approve':
        // Only item owner can approve
        if (item.userId.toString() !== userId) {
          return NextResponse.json(
            { success: false, message: 'Only item owner can approve swap requests' },
            { status: 403 }
          );
        }

        if (swapRequest.status !== 'pending') {
          return NextResponse.json(
            { success: false, message: 'Can only approve pending requests' },
            { status: 400 }
          );
        }

        // Update swap request status
        swapRequest.status = 'approved';
        swapRequest.ownerMessage = message;
        await swapRequest.save();

        // Update item status
        await Item.findByIdAndUpdate(swapRequest.itemId, { status: 'swapped' });
        if (swapRequest.offeredItemId) {
          await Item.findByIdAndUpdate(swapRequest.offeredItemId, { status: 'swapped' });
        }

        // Handle points transfer
        if (swapRequest.pointsOffered > 0) {
          await User.findByIdAndUpdate(swapRequest.requesterId, {
            $inc: { points: -swapRequest.pointsOffered }
          });
          await User.findByIdAndUpdate(item.userId, {
            $inc: { points: swapRequest.pointsOffered }
          });
        }

        if (swapRequest.pointsRequested > 0) {
          await User.findByIdAndUpdate(item.userId, {
            $inc: { points: -swapRequest.pointsRequested }
          });
          await User.findByIdAndUpdate(swapRequest.requesterId, {
            $inc: { points: swapRequest.pointsRequested }
          });
        }

        // Update user stats
        await Promise.all([
          User.findByIdAndUpdate(swapRequest.requesterId, {
            $inc: { 'stats.totalSwaps': 1 }
          }),
          User.findByIdAndUpdate(item.userId, {
            $inc: { 'stats.totalSwaps': 1 }
          })
        ]);

        break;

      case 'reject':
        // Only item owner can reject
        if (item.userId.toString() !== userId) {
          return NextResponse.json(
            { success: false, message: 'Only item owner can reject swap requests' },
            { status: 403 }
          );
        }

        if (swapRequest.status !== 'pending') {
          return NextResponse.json(
            { success: false, message: 'Can only reject pending requests' },
            { status: 400 }
          );
        }

        // Update swap request status
        swapRequest.status = 'rejected';
        swapRequest.ownerMessage = message;
        await swapRequest.save();

        // Reset item status to available
        await Item.findByIdAndUpdate(swapRequest.itemId, { status: 'available' });

        break;

      case 'cancel':
        // Only requester can cancel
        if (swapRequest.requesterId.toString() !== userId) {
          return NextResponse.json(
            { success: false, message: 'Only requester can cancel swap requests' },
            { status: 403 }
          );
        }

        if (swapRequest.status !== 'pending') {
          return NextResponse.json(
            { success: false, message: 'Can only cancel pending requests' },
            { status: 400 }
          );
        }

        // Update swap request status
        swapRequest.status = 'cancelled';
        swapRequest.requesterMessage = message;
        await swapRequest.save();

        // Reset item status to available
        await Item.findByIdAndUpdate(swapRequest.itemId, { status: 'available' });

        break;

      case 'complete':
        // Either party can mark as completed
        const isRequester = swapRequest.requesterId.toString() === userId;
        const isOwner = item.userId.toString() === userId;

        if (!isRequester && !isOwner) {
          return NextResponse.json(
            { success: false, message: 'Only swap participants can complete requests' },
            { status: 403 }
          );
        }

        if (swapRequest.status !== 'approved') {
          return NextResponse.json(
            { success: false, message: 'Can only complete approved requests' },
            { status: 400 }
          );
        }

        // Update swap request status
        swapRequest.status = 'completed';
        if (isRequester) {
          swapRequest.requesterMessage = message;
          if (rating) swapRequest.rating.requester = rating;
          if (review) swapRequest.review.requester = review;
        } else {
          swapRequest.ownerMessage = message;
          if (rating) swapRequest.rating.owner = rating;
          if (review) swapRequest.review.owner = review;
        }
        await swapRequest.save();

        // Update user ratings
        if (rating) {
          const userToUpdate = isRequester ? swapRequest.requesterId : item.userId;
          const user = await User.findById(userToUpdate);
          if (user) {
            const newRating = (user.stats.rating * user.stats.reviews + rating) / (user.stats.reviews + 1);
            await User.findByIdAndUpdate(userToUpdate, {
              $inc: { 'stats.reviews': 1 },
              $set: { 'stats.rating': newRating }
            });
          }
        }

        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    // Populate the updated request
    const updatedRequest = await SwapRequest.findById(id)
      .populate('requesterId', 'name avatar stats.rating')
      .populate('itemId', 'title images points category')
      .populate('offeredItemId', 'title images points category')
      .lean();

    return NextResponse.json({
      success: true,
      message: `Swap request ${action}ed successfully`,
      data: updatedRequest,
    });
  } catch (error: any) {
    console.error('Error updating swap request:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update swap request' },
      { status: 500 }
    );
  }
}

// DELETE /api/swap-requests/[id] - Delete a swap request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Swap request ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const swapRequest = await SwapRequest.findById(id);
    if (!swapRequest) {
      return NextResponse.json(
        { success: false, message: 'Swap request not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to delete this request
    const item = await Item.findById(swapRequest.itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    const isRequester = swapRequest.requesterId.toString() === userId;
    const isOwner = item.userId.toString() === userId;

    if (!isRequester && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this swap request' },
        { status: 403 }
      );
    }

    // Only allow deletion of pending or cancelled requests
    if (!['pending', 'cancelled'].includes(swapRequest.status)) {
      return NextResponse.json(
        { success: false, message: 'Can only delete pending or cancelled requests' },
        { status: 400 }
      );
    }

    // Reset item status if request was pending
    if (swapRequest.status === 'pending') {
      await Item.findByIdAndUpdate(swapRequest.itemId, { status: 'available' });
    }

    // Delete the swap request
    await SwapRequest.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Swap request deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting swap request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete swap request' },
      { status: 500 }
    );
  }
} 