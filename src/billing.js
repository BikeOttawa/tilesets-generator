
const fetch = require('node-fetch');

const TIERS = {
  "30cm": {
    zoom: "15",
    range: "14-16",
    processing_key: "processing30cm",
    processing_limit: 20000
  },
  "1m": {
    zoom: "13",
    range: "11-13",
    processing_key: "processing1m",
    processing_limit: 1000000
  },
  "10m": {
    zoom: "10",
    range: "6-10",
    processing_key: "processing10m",
    processing_limit: 1500000000
  }
}

const getBilling = async function (accessToken) {
  try {
    const response = await fetch(`https://api.mapbox.com/billing/usage/v1?access_token=${accessToken}`)
    const data = await response.json();
    if(!data?.processing1m) throw `Failed to fetch billing data`;
    return data;

  } catch (error) {
    throw error;
  }
};

const getUsage = function(data) {
  return Object.keys(TIERS).map((k) => `${k}(${TIERS[k].range}): ${(+data[TIERS[k].processing_key] * 100 / TIERS[k].processing_limit).toFixed(2)}%`)
}

const getBestZoom = function (data) {
  for(const tier of Object.values(TIERS).sort((a,b) => +b.zoom - +a.zoom)){
    if(data[tier.processing_key] < 0.90 * tier.processing_limit) return tier.zoom;  // 90% limit since billing is updated daily
  }
  return "5"  //always free tier
};

module.exports = {
  getBilling,
  getBestZoom,
  getUsage
};
