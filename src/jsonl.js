import { createWriteStream, createReadStream } from "fs";
import { parse } from "geojson-stream";

export async function convertJSON(jsonPath, jsonlPath) {
  try {
    const ldgeojson = createWriteStream(jsonlPath);
    return new Promise((resolve, reject) => {
      createReadStream(jsonPath)
        .pipe(parse(row => {
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
