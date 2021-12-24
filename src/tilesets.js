export const TILESETS = {
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
                    "maxzoom": 14
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
                    "maxzoom": 12
                }
            }
        }
    },
    "amenities": {
        "tilesetId": "amenities",
        "tilesetSourceId": "amenities-src",
        "tilesetName": "BikeOttawa Amenities",
        "tags": "id amenity leisure playground tourism shop craft name",
        "recipe": {
            "version": 1,
            "layers": {
                "layer": {
                    "source": "mapbox://tileset-source/bikeottawa/amenities-src",
                    "minzoom": 0,
                    "maxzoom": 14
                }
            }
        }
    },
    "pathways": {
        "tilesetId": "pathways",
        "tilesetSourceId": "pathways-src",
        "tilesetName": "BikeOttawa Pathways",
        "tags": "winter_service surface width smoothness lit id highway footway",
        "recipe": {
            "version": 1,
            "layers": {
                "layer": {
                    "source": "mapbox://tileset-source/bikeottawa/pathways-src",
                    "minzoom": 0,
                    "maxzoom": 14
                }
            }
        }
    },
    "lts": {
        "tilesetId": "lts",
        "tilesetSourceId": "lts-src",
        "tilesetName": "BikeOttawa LTS",
        "json": [
            { path: "../ltsanalyzer/levelfiles/level_1.json", tag: "lts1" },
            { path: "../ltsanalyzer/levelfiles/level_2.json", tag: "lts2" },
            { path: "../ltsanalyzer/levelfiles/level_3.json", tag: "lts3" },
            { path: "../ltsanalyzer/levelfiles/level_4.json", tag: "lts4" }
        ],

        "recipe": {
            "version": 1,
            "layers": {
                "layer": {
                    "source": "mapbox://tileset-source/bikeottawa/lts-src",
                    "minzoom": 0,
                    "maxzoom": 14
                }
            }
        }
    }
}
