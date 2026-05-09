const mongoose = require('mongoose');

const footerSchema = new mongoose.Schema({
  about: [
    {
      title: String,
      content: String
    }
  ],
  companyInfo: [
    {
      title: String,
      content: String
    }
  ],
  contacts: String,
  qrcodes: [
    {
      label: String,
      imageUrl: String
    }
  ]
});

module.exports = mongoose.model('Footer', footerSchema);