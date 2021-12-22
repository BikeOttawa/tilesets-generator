const mts = require('@mapbox/mapbox-sdk/services/tilesets');

let mtsService = null;

const initService = async function (accessToken) {
  try {
    mtsService = mts({ accessToken });
  } catch (error) {
    console.log(error);
  }
};

// kick off the sync process by deleting the tileset source
const deleteTilesetSource = async function (tilesetSourceId) {
  try {
    process.stdout.write(`Deleting old tileset source ${tilesetSourceId} ... `)
    const response = await mtsService.deleteTilesetSource({ id: tilesetSourceId }).send();
    if (response.statusCode === 204) {
        console.log('OK!')
        return response;
    }
  } catch (error) {
    console.log(error);
  }
};

// create a tileset source aka upload your data
const createTilesetSource = async function (tilesetSourceId, tilesetSourcePath) {
  // TODO validate the source data first
  // TODO handle multiple files for upload
  process.stdout.write("Uploading the source data ... ");
  try {
    const response = await mtsService.createTilesetSource({ id: tilesetSourceId, file: tilesetSourcePath }).send();
    console.log(`OK! ID: ${response.body.id}. Size: ${response.body.file_size} bytes`);
    // console.log(response.body);
    return response;
  } catch (error) {
    console.log(error);
  }
};

// validate the recipe
const validateRecipe = async function (recipe) {
  try {
    process.stdout.write('Validating recipe ... ')
    const response = await mtsService.validateRecipe({ recipe: recipe }).send();
    if (response.body.valid) {
      console.log("OK!");
      return response;
    } else {
      throw response;
    }
  } catch (error) {
    console.log(error);
  }
};

const tilesetExists = async function (username, tilesetId) {
  try {
    process.stdout.write('Checking if tileset exists ... ')
    const response = await mtsService.listTilesets().send();
    const exists = response.body.filter(tileset => tileset.id === `${username}.${tilesetId}`);
    if (exists.length > 0) {
      console.log("YES");
      return response;
    }
    console.log("NO");
    return false;
  } catch (error) {
    console.log(error);
  }
};

// has the tileset been created? if not, create the tileset using the tileset source
const createTileset = async function (username, tilesetId, tilesetName, recipe) {
  try {
    process.stdout.write(`Creating ${username}.${tilesetId} tileset ... `)
    const response = await mtsService.createTileset({
      tilesetId: `${username}.${tilesetId}`,
      recipe: recipe,
      name: tilesetName
    }).send();
    console.log(`OK!`);
    // console.log(response.body);
    return response;
  } catch (error) {
    console.log(error);
  }
};

// if the tileset exists, make sure it has the latest recipe
const updateRecipe = async function (username, tilesetId, recipe) {
  try {
    process.stdout.write(`Updating ${username}.${tilesetId} tileset ... `)
    const response = await mtsService.updateRecipe({
      tilesetId: `${username}.${tilesetId}`,
      recipe: recipe
    }).send();
    console.log(`OK!`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

// publish the tileset
const publishTileset = async function (username, tilesetId) {
  try {
    process.stdout.write(`Publishing ${username}.${tilesetId} tileset ... `)
    const publishRequest = mtsService.publishTileset({
      tilesetId: `${username}.${tilesetId}`
    });
    publishRequest.query = { pluginName: "BikeOttawa" };
    const response = await publishRequest.send();
    console.log(`OK!`);
    return response;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  initService,
  deleteTilesetSource,
  createTilesetSource,
  validateRecipe,
  tilesetExists,
  createTileset,
  updateRecipe,
  publishTileset,
};
