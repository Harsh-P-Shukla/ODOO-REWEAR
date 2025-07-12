import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['clothing', 'accessories', 'shoes', 'bags', 'jewelry', 'electronics', 'books', 'home'],
      message: 'Category must be one of: clothing, accessories, shoes, bags, jewelry, electronics, books, home',
    },
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters'],
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters'],
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    trim: true,
    maxlength: [50, 'Type cannot exceed 50 characters'],
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    trim: true,
    maxlength: [20, 'Size cannot exceed 20 characters'],
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters'],
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: {
      values: ['new', 'like_new', 'gently_used', 'used', 'vintage'],
      message: 'Condition must be one of: new, like_new, gently_used, used, vintage',
    },
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  images: [{
    type: String,
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(v: string) {
        return v.length > 0;
      },
      message: 'Image URL cannot be empty',
    },
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'pending_swap', 'swapped', 'removed'],
      message: 'Status must be one of: available, pending_swap, swapped, removed',
    },
    default: 'available',
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1'],
    max: [10000, 'Points cannot exceed 10000'],
  },
  location: {
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters'],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters'],
    },
  },
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  swapRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
  }],
}, {
  timestamps: true,
});

// Virtual for formatted price
itemSchema.virtual('formattedPoints').get(function() {
  return `${this.points} points`;
});

// Virtual for full location
itemSchema.virtual('fullLocation').get(function() {
  const parts = [this.location?.city, this.location?.state, this.location?.country].filter(Boolean);
  return parts.join(', ');
});

// Indexes for better search and query performance
itemSchema.index({ title: 'text', description: 'text', tags: 'text', brand: 'text' });
itemSchema.index({ category: 1, status: 1, featured: 1 });
itemSchema.index({ userId: 1, status: 1 });
itemSchema.index({ points: 1 });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ views: -1 });
itemSchema.index({ likes: -1 });

// Ensure virtuals are included in JSON output
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update views
itemSchema.pre('save', function(next) {
  if (this.isNew) {
    this.views = 0;
    this.likes = 0;
  }
  next();
});

export default mongoose.models.Item || mongoose.model('Item', itemSchema); 