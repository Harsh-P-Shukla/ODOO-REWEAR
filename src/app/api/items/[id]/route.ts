import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import User from '@/models/User';

// GET /api/items/[id] - Get a specific item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Find item and populate user info
    const item = await Item.findById(id)
      .populate('userId', 'name avatar bio stats.rating location')
      .lean();

    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await Item.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Get related items (same category, different user)
    const relatedItems = await Item.find({
      category: item.category,
      userId: { $ne: item.userId },
      status: 'available',
      _id: { $ne: id }
    })
      .populate('userId', 'name avatar stats.rating')
      .limit(4)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        relatedItems,
      },
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

// PUT /api/items/[id] - Update an item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Find the item
    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to update this item
    const { userId } = body;
    if (item.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this item' },
        { status: 403 }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'subcategory', 'brand', 'type', 'size', 'color',
      'condition', 'tags', 'images', 'points', 'location', 'status'
    ];

    const updates: any = {};
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Validate points if being updated
    if (updates.points && (updates.points < 1 || updates.points > 10000)) {
      return NextResponse.json(
        { success: false, message: 'Points must be between 1 and 10000' },
        { status: 400 }
      );
    }

    // Update the item
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name avatar stats.rating')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem,
    });
  } catch (error: any) {
    console.error('Error updating item:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete an item
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
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find the item
    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to delete this item
    if (item.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this item' },
        { status: 403 }
      );
    }

    // Check if item has pending swap requests
    const pendingSwaps = await import('@/models/SwapRequest').then(m => m.default).countDocuments({
      itemId: id,
      status: 'pending'
    });

    if (pendingSwaps > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete item with pending swap requests' },
        { status: 400 }
      );
    }

    // Delete the item
    await Item.findByIdAndDelete(id);

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.itemsListed': -1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

// PATCH /api/items/[id] - Partial update (for specific actions like like, feature, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    const { action, userId } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await Item.findById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'like':
        // Toggle like
        const updatedItem = await Item.findByIdAndUpdate(
          id,
          { $inc: { likes: 1 } },
          { new: true }
        )
          .populate('userId', 'name avatar stats.rating')
          .lean();
        
        return NextResponse.json({
          success: true,
          message: 'Item liked successfully',
          data: updatedItem,
        });

      case 'feature':
        // Toggle featured status (admin only)
        if (!userId) {
          return NextResponse.json(
            { success: false, message: 'User ID required for feature action' },
            { status: 400 }
          );
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
          return NextResponse.json(
            { success: false, message: 'Only admins can feature items' },
            { status: 403 }
          );
        }

        const featuredItem = await Item.findByIdAndUpdate(
          id,
          { featured: !item.featured },
          { new: true }
        )
          .populate('userId', 'name avatar stats.rating')
          .lean();

        return NextResponse.json({
          success: true,
          message: `Item ${featuredItem.featured ? 'featured' : 'unfeatured'} successfully`,
          data: featuredItem,
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing item action:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to perform action' },
      { status: 500 }
    );
  }
} 