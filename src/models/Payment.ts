import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  },
  pointsToReceive: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'square', 'manual'],
    required: true,
  },
  gatewayPaymentId: {
    type: String,
    trim: true,
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
  billingDetails: {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    campaign: String,
    adminNote: String,
  },
  refundDetails: {
    amount: Number,
    reason: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: Date,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ gatewayPaymentId: 1 });
paymentSchema.index({ gateway: 1, status: 1 });

// Virtual for full name
paymentSchema.virtual('fullName').get(function() {
  return `${this.billingDetails.firstName} ${this.billingDetails.lastName}`;
});

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.amount.toFixed(2)}`;
});

// Virtual for payment status color
paymentSchema.virtual('statusColor').get(function() {
  switch (this.status) {
    case 'completed': return 'green';
    case 'processing': return 'blue';
    case 'pending': return 'yellow';
    case 'failed': return 'red';
    case 'cancelled': return 'gray';
    case 'refunded': return 'orange';
    default: return 'blue';
  }
});

// Ensure virtuals are included in JSON output
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

// Static method to get payment statistics
paymentSchema.statics.getStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalPoints: { $sum: '$pointsToReceive' },
        completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        avgAmount: { $avg: '$amount' },
        avgPoints: { $avg: '$pointsToReceive' },
      }
    }
  ]);
};

// Static method to get payments by status
paymentSchema.statics.getByStatus = async function(status: string, limit = 10) {
  return this.find({ status })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema); 