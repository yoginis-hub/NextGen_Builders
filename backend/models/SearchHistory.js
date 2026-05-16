const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  searchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  topResultIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  searchType: {
    type: String,
    enum: ['semantic', 'team-builder', 'filter'],
    default: 'semantic'
  },
  responseTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
