const mongoose = require('mongoose');

const {
  NotificationNotFoundError,
  NotificationPermissionError,
  NotificationValidationError
} = require('../../shared/errors');

const {
  ConfirmUserOwnershipPlugin
} = require('../plugins/confirm-user-ownership');

const {
  MongoDbErrorHandlerPlugin
} = require('../plugins/mongodb-error-handler');

const {
  updateDocument
} = require('../utils/update-document');

const Schema = mongoose.Schema;
const notificationSchema = new Schema({
  _user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: [
      true,
      'A user ID must be provided.'
    ]
  },
  type: {
    type: String,
    enum: [
      'gift_comment',
      'gift_comment_also',
      'gift_delivered',
      'gift_received',
      'friendship_new'
    ],
    required: [
      true,
      'A notification type must be provided.'
    ]
  },
  // Since notifications are simply read and deleted,
  // let's denormalize the foreign references, to avoid
  // complex joins later.
  follower: {
    id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    },
    firstName: String,
    lastName: String
  },
  gift: {
    id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'WishList.gifts'
    },
    name: String,
    comment: {
      user: {
        id: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'User'
        },
        firstName: String,
        lastName: String
      },
      summary: String
    },
    dibs: [{
      user: {
        id: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'User'
        },
        firstName: String,
        lastName: String,
        isAnonymous: Boolean
      }
    }]
  }
}, {
  collection: 'notification',
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
});

notificationSchema.statics.create = function (args) {
  const notification = new Notification(args);

  return notification.save();
};

notificationSchema.methods.updateSync = function (values) {
  const fields = [];

  updateDocument(this, fields, values);

  return this;
};

notificationSchema.plugin(MongoDbErrorHandlerPlugin);

notificationSchema.plugin(ConfirmUserOwnershipPlugin, {
  errors: {
    validation: new NotificationValidationError('Please provide a notification ID.'),
    notFound: new NotificationNotFoundError(),
    permission: new NotificationPermissionError()
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  Notification
};