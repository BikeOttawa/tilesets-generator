const fs = require("fs");
const geojsonStream = require("geojson-stream");

async function convertJSON(jsonPath, jsonlPath) {
  try {
    const ldgeojson = fs.createWriteStream(jsonlPath);
    return new Promise((resolve, reject) => {
      fs.createReadStream(jsonPath)
        .pipe(geojsonStream.parse(row => {
          if (row.geometry.coordinates === null) {
            return null;
          }
          return (JSON.stringify(row) + "\r\n");
        }))
        .pipe(ldgeojson)
        .on("finish", () => {
          resolve(true);
        })
        .on("error", reject);
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = { convertJSON }
