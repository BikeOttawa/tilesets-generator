import { createWriteStream, createReadStream } from "fs";
import { parse } from "geojson-stream";

export async function convert(jsons, jsonlPath) {
  try {
    return new Promise((resolve, reject) => {
      const ldgeojson = createWriteStream(jsonlPath);
      let files = jsons.length
      for(let json of jsons) {
        createReadStream(json.path)
          .pipe(parse(row => {
            if (row.geometry.coordinates === null) {
              return null;
            }
            row.properties["tag"] = json["tag"];
            return (JSON.stringify(row) + "\r\n");
          }))
          .pipe(ldgeojson)
          .on("finish", () => {
            if(--files == 0) resolve(true);
          })
          .on("error", reject);
        }
      });
  } catch (err) {
    console.log(err);
  }
}
