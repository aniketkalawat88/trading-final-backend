const mongoose = require('mongoose');

const LiveAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

module.exports = mongoose.model('LiveAccount', LiveAccountSchema);
