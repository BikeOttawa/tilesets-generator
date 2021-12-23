
const exec = require('node-async-exec');
const { TILESETS } = require('./src/tilesets');
const { convertJSON } = require('./src/jsonl');
const mapbox = require('./src/publish');
const billing = require('./src/billing');
const sleep = require('await-sleep');
const fs = require("fs");
require('dotenv').config({ path: `${__dirname}/.env` });

const USERNAME = 'bikeottawa';
const USAGE = `Usage: node index.js tileset [zoom]
- tileset: tileset id, see tilesets.js for definitions
- zoom: optional zoom level`;

(async () => {

    const accessToken = process.env.MAPBOX_TOKEN
    if(!accessToken){
        console.error('Specify Mapbox Token')
        return;
    }

    const [tileset, argZoom] = process.argv.slice(2)
    if(!tileset) {
        console.error(`Tileset not specified\n${USAGE}`)
        return;
    }
    if(argZoom && isNaN(argZoom)) {
        console.error(`Bad zoom value\n${USAGE}`)
        return;
    }

    if(!TILESETS[tileset]){
        console.error(`Tileset not defined: "${tileset}"`)
        return;
    }

    const config = TILESETS[tileset]
    const osmPath = `${__dirname}/data/${tileset}.osm`
    const jsonPath = `${__dirname}/data/${tileset}.json`
    const jsonOldPath = `${__dirname}/data/${tileset}-old.json`
    const jsonlPath = `${__dirname}/data/${tileset}.jsonl`
    const queryPath = `${__dirname}/queries/${tileset}.query`

    console.log(`\n********* ${new Date().toLocaleString()} *********`)
    console.log(`-=Pre-processing OSM data for "${tileset}" tileset=-`)

    try {
        process.stdout.write(`Downloading OSM data to ${osmPath} ... `)
        await exec({
            path: __dirname,
            cmd: [ `wget -nv -O ${osmPath} --post-file=${queryPath} "http://overpass-api.de/api/interpreter" --no-hsts` ]
        })
        console.log('OK!')

        process.stdout.write(`Converting OSM data GeoJSON in ${jsonPath} ... `)
        await exec({
            path: __dirname,
            cmd: [ `osmtogeojson -m ${osmPath} | geojson-pick ${config.tags} > ${jsonPath}` ]
        })
        console.log('OK!')

        // compare by file size - enough for us
        if (fs.existsSync(jsonOldPath) && fs.statSync(jsonPath).size == fs.statSync(jsonOldPath).size){
            console.log('No changes')
            return;
        }
        //TODO: for pathways calculate statistics

        process.stdout.write(`Converting GeoJSON data to GeoJSONl ${jsonlPath} ... `)
        await convertJSON(jsonPath, jsonlPath)
        console.log('OK!')

        fs.renameSync(jsonPath, jsonOldPath);
    }
    catch(err) {
        console.error(`Failed to process OSM data`, err)
        return;
    }

    console.log("-=Determining zoom level=-")

    try {
        const billingData = await billing.getBilling(accessToken);
        const usage = billing.getUsage(billingData)
        console.log(`Usage: ${usage.join(', ')}`)
        const bestZoom = Math.min(
            +billing.getBestZoom(billingData),          // fits free tier
            argZoom ? +argZoom : 15,                    // <= specified cli arg
            +config.recipe.layers.layer.maxzoom );      // <= recipe maxzoom level (no need for amenities at high zoom)
        console.log(`Chosen Zoom level: ${bestZoom}`)
        config.recipe.layers.layer.maxzoom = bestZoom

    } catch (err) {
        console.error(`Failed to determine zoom level based on billing`, err);
        return;
    }
    console.log("-=Publishing tileset to Mapbox=-")

    try {
        await mapbox.initService(accessToken);
        await sleep(1500);
        await mapbox.deleteTilesetSource(config.tilesetSourceId);
        await sleep(1500);
        await mapbox.createTilesetSource(config.tilesetSourceId, jsonlPath);
        await sleep(1500);
        await mapbox.validateRecipe(config.recipe);
        const tilesetAlreadyExists = await mapbox.tilesetExists(USERNAME, config.tilesetId);
        if (!tilesetAlreadyExists) {
          await mapbox.createTileset(USERNAME, config.tilesetId, config.tilesetName, config.recipe);
        } else {
          await mapbox.updateRecipe(USERNAME, config.tilesetId, config.recipe);
        }
        await sleep(1500);
        await mapbox.publishTileset(USERNAME, config.tilesetId);
    } catch (err) {
        console.error(`Failed to publish tileset ${USERNAME}.${config.tilesetId}`, err);
        return;
    }

    console.log('SUCCESS!');

})();
