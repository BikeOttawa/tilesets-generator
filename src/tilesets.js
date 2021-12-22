const TILESETS = {
    "winter": {
        "tilesetId": "winter",
        "tilesetSourceId": "winter-src",
        "tilesetName": "BikeOttawa Winter pathways",
        "tags": "winter_service id",
        "recipe": {
            "version": 1,
            "layers": {
                "layer": {
                    "source": "mapbox://tileset-source/bikeottawa/winter-src",
                    "minzoom": 0,
                    "maxzoom": 13
                }
            }
        }
    },
    "desire": {
        "tilesetId": "desire",
        "tilesetSourceId": "desire-src",
        "tilesetName": "BikeOttawa Desire pathways",
        "tags": "highway surface width id",
        "recipe": {
            "version": 1,
            "layers": {
                "layer": {
                    "source": "mapbox://tileset-source/bikeottawa/desire-src",
                    "minzoom": 0,
                    "maxzoom": 13
                }
            }
        }
    }
}

module.exports = { TILESETS }