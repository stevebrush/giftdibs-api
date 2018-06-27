const mongoose = require('mongoose');

const {
  updateDocument
} = require('../utils/update-document');

const {
  externalUrlSchema
} = require('./external-url');

const {
  commentSchema
} = require('./comment');

const {
  dibSchema
} = require('./dib');

const Schema = mongoose.Schema;
const giftSchema = new Schema({
  budget: {
    type: Number,
    min: [0, 'The gift\'s budget must greater than zero.'],
    max: [
      1000000000000,
      'The gift\'s budget must be less than 1,000,000,000,000.'
    ]
  },
  comments: [
    commentSchema
  ],
  dibs: [
    dibSchema
  ],
  externalUrls: [
    externalUrlSchema
  ],
  isReceived: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: [true, 'Please provide a gift name.'],
    trim: true,
    maxlength: [250, 'The gift\'s name cannot be longer than 250 characters.']
  },
  quantity: {
    type: Number,
    min: [1, 'The gift\'s quantity must be greater than zero.'],
    max: [
      1000000000000,
      'The gift\'s quantity must be less than 1,000,000,000,000.'
    ],
    default: 1
  },
  priority: {
    type: Number,
    min: [0, 'The gift\'s priority must be greater than zero.'],
    max: [10, 'The gift\'s priority must be less than 10.'],
    default: 5
  }
}, {
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
});

giftSchema.methods.moveToWishList = function (wishListId, userId) {
  const instance = this;
  const { WishList } = require('./wish-list');

  return WishList
    .findAuthorized(
      userId,
      {
        $or: [
          { _id: wishListId },
          { 'gifts._id': instance._id }
        ]
      },
      true
    )
    .then((wishLists) => {
      // The gift already belongs to the wish list.
      if (wishLists.length === 1) {
        return {
          gift: instance
        };
      }

      wishLists.forEach((wishList) => {
        const found = wishList.gifts.id(instance._id);

        if (found) {
          wishList.gifts.remove(instance);
        } else {
          wishList.gifts.push(instance);
        }
      });

      // Save wish lists and return the updated documents IDs.
      return Promise
        .all([
          wishLists[0].save(),
          wishLists[1].save()
        ])
        .then((results) => {
          return {
            gift: instance,
            wishListIds: results.map((wishList) => wishList._id)
          };
        });
    });
}

giftSchema.methods.updateSync = function (values) {
  const instance = this;
  const fields = [
    'budget',
    'isReceived',
    'name',
    'priority',
    'quantity'
  ];

  if (!values.quantity) {
    values.quantity = 1;
  }

  updateDocument(instance, fields, values);

  return instance;
};

giftSchema.pre('validate', function (next) {
  if (this.name) {
    // Replace newline characters.
    this.name = this.name.replace(/\r?\n/g, ' ');
  }

  next();
});

module.exports = {
  giftSchema
};
