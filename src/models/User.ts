import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    maxlength: [128, 'Password cannot exceed 128 characters'],
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  points: {
    type: Number,
    default: 100,
    min: [0, 'Points cannot be negative'],
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'moderator', 'admin'],
      message: 'Role must be one of: user, moderator, admin',
    },
    default: 'user',
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
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      swapRequests: {
        type: Boolean,
        default: true,
      },
      newItems: {
        type: Boolean,
        default: false,
      },
    },
    privacy: {
      showLocation: {
        type: Boolean,
        default: true,
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
    },
    categories: [{
      type: String,
      enum: ['clothing', 'accessories', 'shoes', 'bags', 'jewelry', 'electronics', 'books', 'home'],
    }],
  },
  stats: {
    itemsListed: {
      type: Number,
      default: 0,
      min: 0,
    },
    itemsSwapped: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSwaps: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  verification: {
    email: {
      verified: {
        type: Boolean,
        default: false,
      },
      token: String,
      expiresAt: Date,
    },
    phone: {
      verified: {
        type: Boolean,
        default: false,
      },
      number: String,
    },
  },
  social: {
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    website: {
      type: String,
      trim: true,
      maxlength: [200, 'Website URL cannot exceed 200 characters'],
    },
    instagram: {
      type: String,
      trim: true,
      maxlength: [50, 'Instagram handle cannot exceed 50 characters'],
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for full location
userSchema.virtual('fullLocation').get(function() {
  const parts = [this.location?.city, this.location?.state, this.location?.country].filter(Boolean);
  return parts.join(', ');
});

// Virtual for formatted points
userSchema.virtual('formattedPoints').get(function() {
  return `${this.points} points`;
});

// Virtual for user level based on stats
userSchema.virtual('level').get(function() {
  const totalActivity = this.stats.itemsListed + this.stats.itemsSwapped + this.stats.totalSwaps;
  if (totalActivity >= 50) return 'Expert';
  if (totalActivity >= 20) return 'Advanced';
  if (totalActivity >= 10) return 'Intermediate';
  if (totalActivity >= 5) return 'Beginner';
  return 'New';
});

// Indexes for better query performance
userSchema.index({ role: 1 });
userSchema.index({ 'location.city': 1, 'location.state': 1 });
userSchema.index({ 'stats.itemsListed': -1 });
userSchema.index({ 'stats.rating': -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActive: -1 });

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Method to add points
userSchema.methods.addPoints = function(amount: number) {
  this.points += amount;
  return this.save();
};

// Method to deduct points
userSchema.methods.deductPoints = function(amount: number) {
  if (this.points < amount) {
    throw new Error('Insufficient points');
  }
  this.points -= amount;
  return this.save();
};

// Static method to get user statistics
userSchema.statics.getStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
        totalPoints: { $sum: '$points' },
        avgRating: { $avg: '$stats.rating' },
        totalItems: { $sum: '$stats.itemsListed' },
        totalSwaps: { $sum: '$stats.totalSwaps' },
      }
    }
  ]);
};

export default mongoose.models.User || mongoose.model('User', userSchema); 