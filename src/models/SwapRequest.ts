import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester ID is required'],
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item ID is required'],
  },
  offeredItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Offered item ID is required'],
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      message: 'Status must be one of: pending, approved, rejected, cancelled, completed',
    },
    default: 'pending',
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters'],
  },
  requesterMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Requester message cannot exceed 500 characters'],
  },
  ownerMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Owner message cannot exceed 500 characters'],
  },
  pointsOffered: {
    type: Number,
    min: [0, 'Points offered cannot be negative'],
    default: 0,
  },
  pointsRequested: {
    type: Number,
    min: [0, 'Points requested cannot be negative'],
    default: 0,
  },
  swapType: {
    type: String,
    enum: {
      values: ['item_for_item', 'item_for_points', 'points_for_item', 'mixed'],
      message: 'Swap type must be one of: item_for_item, item_for_points, points_for_item, mixed',
    },
    required: [true, 'Swap type is required'],
  },
  meetingLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Meeting location cannot exceed 200 characters'],
  },
  meetingDate: {
    type: Date,
  },
  isRead: {
    requester: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Boolean,
      default: false,
    },
  },
  rating: {
    requester: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    owner: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  review: {
    requester: {
      type: String,
      trim: true,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
    owner: {
      type: String,
      trim: true,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
  },
}, {
  timestamps: true,
});

// Virtual for total points involved
swapRequestSchema.virtual('totalPoints').get(function() {
  return (this.pointsOffered || 0) + (this.pointsRequested || 0);
});

// Virtual for formatted status
swapRequestSchema.virtual('formattedStatus').get(function() {
  const statusMap = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };
  return statusMap[this.status] || this.status;
});

// Indexes for better query performance
swapRequestSchema.index({ requesterId: 1, status: 1 });
swapRequestSchema.index({ itemId: 1, status: 1 });
swapRequestSchema.index({ offeredItemId: 1, status: 1 });
swapRequestSchema.index({ status: 1, createdAt: -1 });
swapRequestSchema.index({ 'isRead.requester': 1, 'isRead.owner': 1 });

// Ensure virtuals are included in JSON output
swapRequestSchema.set('toJSON', { virtuals: true });
swapRequestSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate swap type
swapRequestSchema.pre('save', function(next) {
  if (this.swapType === 'item_for_item' && !this.offeredItemId) {
    return next(new Error('Offered item is required for item-for-item swaps'));
  }
  if (this.swapType === 'item_for_points' && this.pointsOffered <= 0) {
    return next(new Error('Points offered must be greater than 0 for item-for-points swaps'));
  }
  if (this.swapType === 'points_for_item' && this.pointsRequested <= 0) {
    return next(new Error('Points requested must be greater than 0 for points-for-item swaps'));
  }
  next();
});

// Static method to get swap statistics
swapRequestSchema.statics.getStats = async function(userId: string) {
  const stats = await this.aggregate([
    {
      $match: {
        $or: [
          { requesterId: new mongoose.Types.ObjectId(userId) },
          { itemId: { $in: await mongoose.model('Item').find({ userId }).distinct('_id') } }
        ]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
};

export default mongoose.models.SwapRequest || mongoose.model('SwapRequest', swapRequestSchema); 