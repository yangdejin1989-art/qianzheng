const mongoose = require('mongoose');

const introductionSchema = new mongoose.Schema({
  title: String,
  sections: [
    {
      title: String,
      content: String,
      imageUrl: String,
      order: { type: Number, default: 0 },
      visible: { type: Boolean, default: true },
      layout: { type: String, enum: ['left-image', 'right-image', 'no-image'], default: 'left-image' }
    }
  ],
  visible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Introduction', introductionSchema);