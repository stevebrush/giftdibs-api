# GiftDibs API

## HTTP Status Codes

- `200` The request is okay.
- `400` The request is not formatted correctly.
- `401` The request is not authenticated.
- `403` The request does not have permission to perform the desired action.
- `404` The endpoint does not exist.
- `500` The server encountered an error.

## Error Codes

### General

- `0` Uncaught server error.
- `1` The ObjectId provided in the request is formatted incorrectly (mongoose `CastError`).

### `/auth`

- `100` The login request is missing credentials.
- `101` A user was not found matching the login credentials provided.
- `102` The registration request failed database schema validation.
- `103` The request user does not have permission to modify the resource.
- `104` The email address entered during a password reset request was not found.
- `105` The password and password again did not match, during a password reset request.
- `106` The reset password token is invalid.
- `107` The password was not valid during a reset password request.
- `108` Misc.

### `/users`

- `200` A user was not found with the specified ID.
- `201` The user update request failed database schema validation.
