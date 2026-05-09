const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
  imageUrl: String,
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  position: { type: String, enum: ['center', 'top', 'bottom'], default: 'center' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Carousel', carouselSchema);