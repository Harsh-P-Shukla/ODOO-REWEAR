import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { itemId } = await request.json();
    
    if (!itemId) {
      return NextResponse.json(
        { success: false, message: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid item ID format' },
        { status: 400 }
      );
    }

    // Find the item
    const item = await Item.findById(itemId).populate('userId', 'name email');
    if (!item) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if item is available
    if (item.status !== 'available') {
      return NextResponse.json(
        { success: false, message: 'Item is not available for purchase' },
        { status: 400 }
      );
    }

    // Check if user is trying to buy their own item
    if (item.userId._id.toString() === user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'You cannot buy your own item' },
        { status: 400 }
      );
    }

    // Check if user has enough points
    if (user.points < item.points) {
      return NextResponse.json(
        { success: false, message: 'Insufficient points to purchase this item' },
        { status: 400 }
      );
    }

    // Get seller info
    const seller = await User.findById(item.userId._id);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: 'Seller not found' },
        { status: 404 }
      );
    }

    // Perform operations without transactions (for standalone MongoDB)
    try {
      // Update buyer's points
      const buyerBalanceBefore = user.points;
      user.points -= item.points;
      user.stats = user.stats || {};
      user.stats.itemsSwapped = (user.stats.itemsSwapped || 0) + 1;
      user.stats.totalSwaps = (user.stats.totalSwaps || 0) + 1;
      await user.save();

      // Update seller's points (they get 90% of the points, 10% goes to platform)
      const sellerBalanceBefore = seller.points;
      const sellerEarnings = Math.floor(item.points * 0.9);
      seller.points += sellerEarnings;
      seller.stats = seller.stats || {};
      seller.stats.itemsSwapped = (seller.stats.itemsSwapped || 0) + 1;
      seller.stats.totalSwaps = (seller.stats.totalSwaps || 0) + 1;
      await seller.save();

      // Update item status
      item.status = 'swapped';
      item.buyerId = user._id;
      item.swappedAt = new Date();
      await item.save();

      // Create transaction records
      await Transaction.create([
        {
          userId: user._id,
          type: 'deduction',
          amount: item.points,
          description: `Purchased: ${item.title}`,
          status: 'completed',
          balanceBefore: buyerBalanceBefore,
          balanceAfter: user.points,
          itemId: item._id,
        },
        {
          userId: seller._id,
          type: 'bonus',
          amount: sellerEarnings,
          description: `Sold: ${item.title}`,
          status: 'completed',
          balanceBefore: sellerBalanceBefore,
          balanceAfter: seller.points,
          itemId: item._id,
        }
      ]);

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Item purchased successfully!',
        data: {
          item: {
            _id: item._id,
            title: item.title,
            points: item.points,
            status: item.status,
          },
          buyer: {
            points: user.points,
            balanceBefore: buyerBalanceBefore,
            balanceAfter: user.points,
          },
          seller: {
            points: seller.points,
            balanceBefore: sellerBalanceBefore,
            balanceAfter: seller.points,
          }
        }
      });

    } catch (operationError) {
      console.error('Operation error:', operationError);
      return NextResponse.json(
        { success: false, message: 'Failed to complete purchase' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error redeeming item:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, message: 'Invalid item ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to purchase item' },
      { status: 500 }
    );
  }
} 