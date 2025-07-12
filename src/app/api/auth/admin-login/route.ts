import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

const ADMIN_PASSKEY = '111111';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { passkey } = await request.json();
    
    // Validate input
    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey is required' },
        { status: 400 }
      );
    }
    
    // Validate passkey
    if (passkey !== ADMIN_PASSKEY) {
      return NextResponse.json(
        { error: 'Invalid passkey' },
        { status: 401 }
      );
    }
    
    // Create or find admin user
    let user = await User.findOne({ role: 'admin' });
    
    if (!user) {
      // Create a default admin user if none exists
      user = await User.create({
        name: 'Admin User',
        email: 'admin@rewear.com',
        password: 'admin123', // This won't be used for login
        role: 'admin',
        points: 10000,
        isActive: true,
        stats: {
          itemsListed: 0,
          itemsSwapped: 0,
          totalSwaps: 0,
          rating: 5.0,
          reviews: 0,
        },
        level: 'admin',
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Create response with token in cookie
    const response = NextResponse.json(
      { 
        message: 'Admin login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          points: user.points,
          role: user.role,
          avatar: user.avatar,
          stats: user.stats,
          level: user.level,
        }
      },
      { status: 200 }
    );
    
    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    
    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 