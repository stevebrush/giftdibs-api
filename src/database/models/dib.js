const mongoose = require('mongoose');

const {
  MongoDbErrorHandlerPlugin
} = require('../plugins/mongodb-error-handler');

const { updateDocument } = require('../utils/update-document');

const Schema = mongoose.Schema;
const dibSchema = new Schema({
  _gift: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Gift',
    required: [true, 'A gift ID must be provided.']
  },
  _user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'A user ID must be provided.']
  },
  dateDelivered: Date,
  pricePaid: {
    type: Number,
    min: [0, 'The price paid must be at least zero.'],
    max: [1000000000000, 'The price paid must be less than 1,000,000,000,000.']
  },
  quantity: {
    required: [true, 'The dib\'s quantity must be provided.'],
    type: Number,
    min: [1, 'The dib\'s quantity must be at least 1.'],
    max: [
      1000000000000,
      'The dib\'s quantity must be less than 1,000,000,000,000.'
    ]
  }
}, {
  collection: 'dib',
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
});

dibSchema.methods.updateSync = function (values) {
  const fields = ['pricePaid', 'quantity'];

  // Update the date delivered if user marks the dib as delivered
  // (for the first time).
  if (values.isDelivered === true && !this.dateDelivered) {
    this.set('dateDelivered', new Date());
  } else if (values.isDelivered === false) {
    this.set('dateDelivered', undefined);
  }

  updateDocument(this, fields, values);

  return this;
};

dibSchema.plugin(MongoDbErrorHandlerPlugin);

const Dib = mongoose.model('Dib', dibSchema);

module.exports = { Dib };
