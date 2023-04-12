const AWS = require('aws-sdk')

module.exports.uploadToS3 = function(data, filename) {
    const BUCKET_NAME = "expensetrackingapplicationdemo";
    const IAM_USER_KEY = "AKIAYFGA4UE3UUT2Y4SZ";
    const IAM_USER_SECRET = "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";
  
    let s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
    });
  
    var params = {
      Bucket: BUCKET_NAME,
      Body: data,
      Key: filename,
      ACL: "public-read",
    };
    return new Promise((resolve, reject) => {
      s3bucket.upload(params, (error, s3response) => {
        if (error) {
          console.log("something went wrong", error);
          reject(error);
        } else {
          resolve(s3response.Location);
        }
      });
    });
  }