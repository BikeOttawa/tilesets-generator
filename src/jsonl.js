import { createWriteStream, createReadStream } from "fs";
import { parse } from "geojson-stream";

async function convertJson(json, jsonlPath) {
  const ldgeojson = createWriteStream(jsonlPath, {flags: "a"});
  return new Promise((resolve, reject) => {
    createReadStream(json.path)
      .pipe(parse(row => {
        if (row.geometry?.coordinates === null) return null;
        row.properties["tag"] = json["tag"];
        return (JSON.stringify(row) + "\r\n");
      }))
      .pipe(ldgeojson)
      .on("finish", () => { resolve(true); })
      .on("error", reject);
  })
}

export async function convert(jsons, jsonlPath) {
  createWriteStream(jsonlPath);
  try {
    for(const json of jsons){
      await convertJson(json, jsonlPath)
    }
  } catch (err) {
    console.log("FAILED", err);
  }
}
