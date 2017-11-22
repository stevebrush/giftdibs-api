const authResponse = require('../../middleware/auth-response');

const {
  User
} = require('../../database/models/user');

const {
  UserNotFoundError
} = require('../../shared/errors');

function getSelectFields(req) {
  let selectFields;

  if (req.user._id.equals(req.params.userId)) {
    selectFields = [
      'facebookId',
      'firstName',
      'lastName',
      'emailAddress',
      'emailAddressVerified'
    ].join(' ');
  } else {
    selectFields = [
      'firstName',
      'lastName',
      'emailAddressVerified'
    ].join(' ');
  }

  return selectFields;
}

function getUser(req, res, next) {
  const selectFields = getSelectFields(req);

  User
    .find({ _id: req.params.userId })
    .limit(1)
    .select(selectFields)
    .lean()
    .then((docs) => {
      const user = docs[0];

      if (!user) {
        return Promise.reject(new UserNotFoundError());
      }

      authResponse({
        user
      })(req, res, next);
    })
    .catch(next);
}

function getUsers(req, res, next) {
  const selectFields = getSelectFields(req);

  User
    .find({})
    .select(selectFields)
    .lean()
    .then((users) => {
      authResponse({
        users
      })(req, res, next);
    })
    .catch(next);
}

module.exports = {
  getUser,
  getUsers
};
