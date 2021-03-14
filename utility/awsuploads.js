require("dotenv").config();
const AWS = require("aws-sdk");
const crypto = require("crypto");
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

const getMetaData = (value) => {
  return {
    mimeType: value.substring(value.indexOf(":") + 1, value.indexOf(";")),
    encoding: value.substring(value.indexOf(";") + 1),
  };
};

function generateRandomName(name, flag) {
  if (!flag) name += Date().toString();
  return crypto.createHash("sha256").update(name).digest("hex");
}

const upload = (images, isProfilePicture = false, uid = "") => {
  return new Promise((resolve, reject) => {
    try {
      const imageUrls = [];
      if (images.length === 0) resolve([]);
      images.forEach(async (image) => {
        let nameOfImage = isProfilePicture
          ? uid.toString() + Date.now().toString()
          : image.name;
        let base64OfImage = image.data;
        let value = base64OfImage.substring(0, base64OfImage.indexOf(","));
        base64OfImage = Buffer.from(
          base64OfImage.replace(/^data:image\/\w+;base64,/, ""),
          "base64"
        );
        let { mimeType, encoding } = getMetaData(value);
        let ext = mimeType.substr(mimeType.indexOf("/") + 1);
        let key = generateRandomName(nameOfImage, isProfilePicture) + "." + ext;
        let params = {
          ACL: "public-read",
          Body: base64OfImage,
          Bucket: process.env.S3_BUCKET,
          ContentType: mimeType,
          ContentEncoding: encoding,
          Key: key,
        };
        let data = await s3.upload(params).promise();
        imageUrls.push(data.Location);
        if (imageUrls.length === images.length) {
          resolve(imageUrls);
        }
      });
    } catch (e) {
      // commented because its being caught at caller function
      // console.error(e);
      reject(e);
    }
  });
};

module.exports = { upload: upload };
