import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    const { name, email, password } = await request.json();
    
    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }
    
    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      points: 100, // Starting points
      role: 'user',
      isActive: true,
    });
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Create response with token in cookie
    const response = NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          points: user.points,
          role: user.role,
        }
      },
      { status: 201 }
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
    console.error('Registration error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: validationErrors[0] || 'Validation failed' },
        { status: 400 }
      );
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 