const aws = require('aws-sdk');
const sharp = require('sharp');

const S3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION
});

const BUCKET = process.env.AWS_S3_BUCKET;

function remove(key) {
  const params = {
    Bucket: BUCKET,
    Key: key
  };

  return new Promise((resolve, reject) => {
    S3.deleteObject(params, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

function upload(file, fileName) {
  const fileType = file.mimetype.toLowerCase();

  // Verify file type.
  if (
    fileType !== 'image/jpeg' &&
    fileType !== 'image/png' &&
    fileType !== 'image/gif' &&
    fileType !== 'image/webp'
  ) {
    const err = new Error(
      'Please provide an image of type JPG, PNG, GIF, or WebP.'
    );
    err.status = 400;
    return Promise.reject(err);
  }

  return sharp(file.buffer)
    .resize(600, undefined) // resize width only
    .jpeg({
      quality: 75
    })
    .toBuffer()
    .then((buffer) => {
      const params = {
        Bucket: BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: 'image/jpg',
        ACL: 'public-read'
      };

      return new Promise((resolve, reject) => {
        S3.putObject(params, (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(`https://${BUCKET}.s3.amazonaws.com/${fileName}`);
        });
      });
    });
}

module.exports = {
  remove,
  upload
};
