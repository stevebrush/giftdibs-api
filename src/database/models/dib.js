const mongoose = require('mongoose');

const {
  MongoDbErrorHandlerPlugin
} = require('../plugins/mongodb-error-handler');

const {
  updateDocument
} = require('../utils/update-document');

const Schema = mongoose.Schema;
const dibSchema = new Schema({
  _user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: [true, 'A user ID must be provided.']
  },
  dateDelivered: Date,
  isAnonymous: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [
      1001,
      'Notes cannot be longer than 1000 characters.'
    ]
  },
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
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
});

function formatDibResponse(dib, userId) {
  const dibId = dib._user._id || dib._user;

  const isDibOwner = (
    dibId.toString() === userId.toString()
  );

  if (dib.isAnonymous && !isDibOwner) {
    dib.user = {};
  } else {
    dib.user = dib._user;
  }

  delete dib._user;

  return dib;
};

dibSchema.methods.updateSync = function (values) {
  const fields = [
    'isAnonymous',
    'notes',
    'pricePaid',
    'quantity'
  ];

  if (!values.quantity) {
    values.quantity = 1;
  }

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

module.exports = {
  dibSchema,
  formatDibResponse
};
