import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    preferences: {
      currency: {
        type: String,
        default: 'LKR', // ✅ Set LKR as default for Sri Lanka
        enum: ['USD', 'EUR', 'GBP', 'LKR', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'],
      },
      monthlyBudget: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);