import { createWriteStream, createReadStream } from "fs";
import { parse } from "geojson-stream";

export async function convert(jsons, jsonlPath) {
  try {
    const ldgeojson = createWriteStream(jsonlPath);
    const promises = jsons.map(json => new Promise((resolve, reject) => {
      createReadStream(json.path)
        .pipe(parse(row => {
          if (row.geometry?.coordinates === null) {
            return null;
          }
          row.properties["tag"] = json["tag"];
          return (JSON.stringify(row) + "\r\n");
        }))
        .pipe(ldgeojson)
        .on("finish", () => {
          resolve(true);
        })
        .on("error", reject);
    }))
    await Promise.all(promises);
  } catch (err) {
    console.log(err);
  }
}
