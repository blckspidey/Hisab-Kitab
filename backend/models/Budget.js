const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    month: { type: Number, required: false },
    year: { type: Number, required: false },
    week: { type: Number, required: false }, // Week number (1-52)
    budgetType: { 
      type: String, 
      enum: ['monthly', 'weekly'], 
      default: 'monthly',
      required: true 
    },
    alertThreshold: { 
      type: Number, 
      default: 80, 
      min: 0, 
      max: 100 
    }, // Percentage threshold for alerts
    isActive: { type: Boolean, default: true },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
