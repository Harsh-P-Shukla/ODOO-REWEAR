import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'deduction', 'transfer', 'bonus', 'refund'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    maxlength: 200,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'system'],
    default: 'system',
  },
  paymentId: {
    type: String,
    trim: true,
  },
  metadata: {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    swapRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwapRequest',
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: String,
    adminNote: String,
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ paymentId: 1 });
transactionSchema.index({ 'metadata.itemId': 1 });
transactionSchema.index({ 'metadata.swapRequestId': 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `${this.type === 'deduction' ? '-' : '+'}${this.amount} points`;
});

// Virtual for transaction status color
transactionSchema.virtual('statusColor').get(function() {
  switch (this.status) {
    case 'completed': return 'green';
    case 'pending': return 'yellow';
    case 'failed': return 'red';
    case 'cancelled': return 'gray';
    default: return 'blue';
  }
});

// Ensure virtuals are included in JSON output
transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

// Static method to get user transaction statistics
transactionSchema.statics.getUserStats = async function(userId: string) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalPurchased: { $sum: { $cond: [{ $eq: ['$type', 'purchase'] }, '$amount', 0] } },
        totalDeducted: { $sum: { $cond: [{ $eq: ['$type', 'deduction'] }, '$amount', 0] } },
        totalBonus: { $sum: { $cond: [{ $eq: ['$type', 'bonus'] }, '$amount', 0] } },
        completedTransactions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        pendingTransactions: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      }
    }
  ]);
};

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema); 