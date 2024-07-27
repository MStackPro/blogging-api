const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: String,
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  state: { type: String, enum: ['draft', 'published'], default: 'draft' },
  read_count: { type: Number, default: 0 },
  reading_time: Number,
  body: { type: String, required: true }
});

postSchema.methods.calculateReadingTime = function() {
  const wordCount = this.body.split(' ').length;
  this.reading_time = Math.ceil(wordCount / 200);
};

module.exports = mongoose.model('Post', postSchema);
