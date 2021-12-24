
import exec from 'node-async-exec';
import { TILESETS } from './src/tilesets.js';
import * as jsonl from './src/jsonl.js';
import * as mapbox from './src/publish.js';
import * as billing from './src/billing.js';
import sleep from 'await-sleep';
import { existsSync, statSync, renameSync } from "fs";
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: `${__dirname}/.env` });

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
    const jsonPath = config.json?.map(json => { return { tags: json.tags, path: `${__dirname}/${json.path}`}}) ?? [ { path: `${__dirname}/data/${tileset}.json`} ]
    const jsonlPath = `${__dirname}/data/${tileset}.jsonl`
    const jsonlOldPath = `${__dirname}/data/${tileset}-old.jsonl`
    const queryPath = `${__dirname}/queries/${tileset}.query`

    console.log(`\n********* ${new Date().toLocaleString()} *********`)
    console.log(`-=Pre-processing OSM data for "${tileset}" tileset=-`)

    try {
        if(!config.json) {
            process.stdout.write(`Downloading OSM data to ${osmPath} ... `)
            await exec({
                path: __dirname,
                cmd: [ `wget -nv -O ${osmPath} --post-file=${queryPath} "http://overpass-api.de/api/interpreter" --no-hsts` ]
            })
            console.log('OK!')

            process.stdout.write(`Converting OSM data to GeoJSON ${jsonPath[0].path} ... `)
            await exec({
                path: __dirname,
                cmd: [ `osmtogeojson -m ${osmPath} | geojson-pick ${config.tags} > ${jsonPath[0].path}` ]
            })
            console.log('OK!')
        }

        //TODO: for pathways calculate statistics

        process.stdout.write(`Converting GeoJSON data to GeoJSONl ${jsonlPath} ... `)
        await jsonl.convert(jsonPath, jsonlPath)
        console.log('OK!')

        // compare by file size - enough for us
        if (existsSync(jsonlOldPath) && statSync(jsonlPath).size == statSync(jsonlOldPath).size){
            console.log('No changes')
            return;
        }

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

        renameSync(jsonlPath, jsonlOldPath);
    } catch (err) {
        console.error(`Failed to publish tileset ${USERNAME}.${config.tilesetId}`, err);
        return;
    }

    console.log('SUCCESS!');

})();
