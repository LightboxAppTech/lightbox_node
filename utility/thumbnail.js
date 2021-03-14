const sharp = require("sharp");
module.exports = (obj) => {
  return new Promise((resolve, reject) => {
    let image = obj.data;
    let bufferData = Buffer.from(
      image.substr(image.indexOf(",") + 1),
      "base64"
    );
    image = image.substring(0, image.indexOf(",") + 1);
    sharp(bufferData)
      .resize(200, 200, { fit: "cover" })
      .toBuffer()
      .then((data) => {
        obj.data = image + Buffer.from(data, "hex").toString("base64");
        // console.log(obj);
        resolve(obj);
      })
      .catch((e) => {
        console.error(e);
        reject(e);
      });
  });
};
