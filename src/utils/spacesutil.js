const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('./config');

const upload = multer({
  storage: multerS3({
    s3: config.S3,
    bucket: 'ramble',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (request, file, cb) {
      cb(null, 'user_profile/' + file.originalname);
    },
  }),
}).single('upload');

const uploadIdCard = multer({
  storage: multerS3({
    s3: config.S3,
    bucket: 'ramble',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (request, file, cb) {
      cb(null, 'idcard/' + file.originalname);
    },
  }),
}).fields([
  { name: 'idcard', maxCount: 1 },
  { name: 'idcardwithperson', maxCount: 1 },
]);

const deleteFile = (fileName, res) => {
  const delParams = {
    Bucket: 'ramble',
    Key: fileName,
  };
  config.S3.deleteObject(delParams, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      return res.status(400).json({ data: 'Something went wrong' });
    } else {
      return res.status(200).json({ data: 'Deleted successfully' });
    }
  });
};

module.exports = { upload, deleteFile, uploadIdCard };
