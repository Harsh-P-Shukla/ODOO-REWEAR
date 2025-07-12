import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Item from '@/models/Item';
import SwapRequest from '@/models/SwapRequest';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await dbConnect();
    
    // Get user's items
    const userItems = await Item.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get user's swap requests
    const swapRequests = await SwapRequest.find({
      $or: [
        { requesterId: user._id },
        { recipientId: user._id }
      ]
    })
    .populate('itemId', 'title images')
    .populate('requesterId', 'name email')
    .populate('recipientId', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get user statistics
    const userStats = await User.findById(user._id)
      .select('stats points level');
    
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        points: user.points,
        role: user.role,
        stats: userStats?.stats,
        level: userStats?.level,
        preferences: user.preferences,
        verification: user.verification,
        social: user.social,
        createdAt: user.createdAt,
        lastActive: user.lastActive,
      },
      recentItems: userItems,
      recentSwapRequests: swapRequests,
      recentTransactions,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await dbConnect();
    
    const updateData = await request.json();
    
    // Fields that can be updated
    const allowedFields = [
      'name', 'bio', 'avatar', 'location', 'preferences', 'social'
    ];
    
    const updateFields: any = {};
    
    // Validate and prepare update data
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    }
    
    // Validate name length
    if (updateFields.name && updateFields.name.length > 50) {
      return NextResponse.json(
        { error: 'Name cannot exceed 50 characters' },
        { status: 400 }
      );
    }
    
    // Validate bio length
    if (updateFields.bio && updateFields.bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio cannot exceed 500 characters' },
        { status: 400 }
      );
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        location: updatedUser.location,
        points: updatedUser.points,
        role: updatedUser.role,
        stats: updatedUser.stats,
        level: updatedUser.level,
        preferences: updatedUser.preferences,
        verification: updatedUser.verification,
        social: updatedUser.social,
        createdAt: updatedUser.createdAt,
        lastActive: updatedUser.lastActive,
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 