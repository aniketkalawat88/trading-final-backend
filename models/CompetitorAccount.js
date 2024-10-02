const mongoose = require('mongoose');

const CompetitorAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateRange: {
    type: String,
    enum: ['1-15', '15-30'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    trim: true
  },
  aadhar:{
    type:Number,
    required:false
  }
}, { timestamps: true });

module.exports = mongoose.model('CompetitorAccount', CompetitorAccountSchema);
