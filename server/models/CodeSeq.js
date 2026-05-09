const mongoose = require('mongoose');

const codeSeqSchema = new mongoose.Schema({
  date: String,
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('CodeSeq', codeSeqSchema);