import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Item from '@/models/Item';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Create a test user if it doesn't exist
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        points: 1000,
        role: 'user',
        isActive: true,
      });
    }

    // Create sample items
    const sampleItems = [
      {
        title: 'Vintage Denim Jacket',
        description: 'A classic vintage denim jacket in excellent condition. Perfect for layering and adding a retro touch to any outfit.',
        category: 'clothing',
        type: 'Jacket',
        size: 'M',
        condition: 'vintage',
        points: 150,
        brand: 'Levi\'s',
        location: 'New York, NY',
        images: [
          'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=400&fit=crop',
        ],
        status: 'available',
        userId: testUser._id,
      },
      {
        title: 'Leather Crossbody Bag',
        description: 'Elegant leather crossbody bag with adjustable strap. Perfect for everyday use.',
        category: 'bags',
        type: 'Crossbody',
        size: 'One Size',
        condition: 'gently_used',
        points: 200,
        brand: 'Coach',
        location: 'Los Angeles, CA',
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
        ],
        status: 'available',
        userId: testUser._id,
      },
      {
        title: 'Classic White Sneakers',
        description: 'Comfortable and stylish white sneakers. Great for casual wear.',
        category: 'shoes',
        type: 'Sneakers',
        size: '10',
        condition: 'like_new',
        points: 180,
        brand: 'Nike',
        location: 'Chicago, IL',
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d114d2c9d?w=400&h=400&fit=crop',
        ],
        status: 'available',
        userId: testUser._id,
      },
      {
        title: 'Silk Scarf Collection',
        description: 'Beautiful silk scarves in various colors. Perfect accessory for any outfit.',
        category: 'accessories',
        type: 'Scarf',
        size: 'One Size',
        condition: 'new',
        points: 80,
        brand: 'Hermès',
        location: 'Miami, FL',
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        ],
        status: 'available',
        userId: testUser._id,
      },
      {
        title: 'Gold Chain Necklace',
        description: 'Elegant gold chain necklace. Perfect for special occasions.',
        category: 'jewelry',
        type: 'Necklace',
        size: '18"',
        condition: 'gently_used',
        points: 120,
        brand: 'Cartier',
        location: 'San Francisco, CA',
        images: [
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
        ],
        status: 'available',
        userId: testUser._id,
      },
      {
        title: 'Summer Dress',
        description: 'Light and flowy summer dress. Perfect for warm weather.',
        category: 'clothing',
        type: 'Dress',
        size: 'S',
        condition: 'like_new',
        points: 90,
        brand: 'Zara',
        location: 'Boston, MA',
        images: [
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
        ],
        status: 'available',
        userId: testUser._id,
      },
    ];

    // Clear existing items and add new ones
    await Item.deleteMany({});
    const createdItems = await Item.create(sampleItems);

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        user: {
          id: testUser._id,
          name: testUser.name,
          email: testUser.email,
          points: testUser.points,
        },
        items: createdItems.map(item => ({
          id: item._id,
          title: item.title,
          points: item.points,
        })),
      },
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create test data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    const itemCount = await Item.countDocuments();
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      data: {
        items: itemCount,
        users: userCount,
      },
    });
  } catch (error) {
    console.error('Error getting test data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get test data' },
      { status: 500 }
    );
  }
} 