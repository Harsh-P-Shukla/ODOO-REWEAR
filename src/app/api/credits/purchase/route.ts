import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, addUserPoints } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

// Credit packages configuration
const CREDIT_PACKAGES = {
  starter: { points: 50, price: 4.99 },
  basic: { points: 100, price: 8.99 },
  popular: { points: 250, price: 19.99 },
  premium: { points: 500, price: 34.99 },
  ultimate: { points: 1000, price: 59.99 },
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await dbConnect();
    
    const { packageId, paymentMethod, billingDetails } = await request.json();
    
    // Validate package
    const creditPackage = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];
    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      );
    }
    
    // Validate payment method
    const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'stripe'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }
    
    // Validate billing details
    if (!billingDetails?.firstName || !billingDetails?.lastName || !billingDetails?.email) {
      return NextResponse.json(
        { error: 'Billing details are required' },
        { status: 400 }
      );
    }
    
    // Create payment record
    const payment = await Payment.create({
      userId: user._id,
      amount: creditPackage.price,
      pointsToReceive: creditPackage.points,
      paymentMethod,
      gateway: paymentMethod === 'paypal' ? 'paypal' : 'stripe',
      billingDetails: {
        firstName: billingDetails.firstName,
        lastName: billingDetails.lastName,
        email: billingDetails.email,
        phone: billingDetails.phone,
        address: billingDetails.address,
      },
      metadata: {
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
      },
    });
    
    // In a real application, you would integrate with a payment gateway here
    // For now, we'll simulate a successful payment
    let paymentStatus = 'completed';
    let gatewayPaymentId = `mock_${Date.now()}`;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update payment status
    payment.status = paymentStatus;
    payment.gatewayPaymentId = gatewayPaymentId;
    payment.gatewayResponse = {
      success: true,
      transactionId: gatewayPaymentId,
      processedAt: new Date(),
    };
    await payment.save();
    
    // Add points to user account
    if (paymentStatus === 'completed') {
      await addUserPoints(
        user._id.toString(),
        creditPackage.points,
        `Credit purchase - ${packageId} package`,
        'purchase'
      );
    }
    
    return NextResponse.json({
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        pointsReceived: payment.pointsToReceive,
        status: payment.status,
        transactionId: payment.gatewayPaymentId,
      },
      user: {
        points: user.points + creditPackage.points,
      }
    });
    
  } catch (error) {
    console.error('Payment error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    
    return NextResponse.json({
      packages: CREDIT_PACKAGES,
      message: 'Credit packages retrieved successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
} 