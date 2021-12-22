const mbxTilesets = require('@mapbox/mapbox-sdk/services/tilesets');
require('dotenv').config();
const exec = require('node-async-exec');
const { TILESETS } = require('./src/tilesets');

(async () => {

    const accessToken = process.env.MAPBOX_TOKEN
    if(!accessToken){
        console.error('Specify Mapbox Token')
        return;
    }
    const mtsService = await mbxTilesets({ accessToken });

    const tileset = 'winter'
    if(TILESETS[tileset]){
        console.error(`Tileset does not exist: "${tileset}"`)
        return;
    }

    const { tags } = TILESETS[tileset]

    const commands = [
        `wget -nv -O ./data/${tileset}.osm --post-file=./queries/${tileset}.query "http://overpass-api.de/api/interpreter" --no-hsts`,
        `osmtogeojson -m ./data/${tileset}.osm | geojson-pick ${tags} > ./data/${tileset}.json`
    ];
    await exec({
        path: __dirname,
        cmd: commands
    })
    console.log("Done")

})();
