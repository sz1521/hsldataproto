// https://gist.github.com/mjaakko/f148be987734fdb9f7f8e71458516571#file-bbox2geohashes-js
// Converts a bounding box bounded by minLat and maxLat and minLng and maxLng to a list of geohashes (e.g. ["60;24/19/84", "60;24/19/85"]) used for MQTT topic filters
export default function bbox2geohashes(minLat, minLng, maxLat, maxLng) {
  var deltaLat = maxLat - minLat;
  var deltaLng = maxLng - minLng;

  var geohashLevel = Math.max(
    Math.ceil(Math.abs(Math.log10(deltaLat))),
    Math.ceil(Math.abs(Math.log10(deltaLng)))
  );
  var delta = Math.pow(10, -geohashLevel);

  var geohashes = [];

  var lat = truncate(minLat, geohashLevel);

  while (lat < maxLat) {
    var lng = truncate(minLng, geohashLevel);
    while (lng < maxLng) {
      geohashes.push(calculateGeohash(lat, lng, geohashLevel));
      lng += delta;
    }
    lat += delta;
  }

  return geohashes;
}

const calculateGeohash = (lat, lng, level) => {
  var geohash = Math.floor(lat) + ";" + Math.floor(lng);

  for (var i = 0; i < level; i++) {
    geohash += "/";
    geohash += lat.toFixed(level + 1).split(".")[1][i];
    geohash += lng.toFixed(level + 1).split(".")[1][i];
  }

  return geohash;
};

const truncate = (x, n) => {
  if (n === 0) {
    return x;
  }

  var split = x.toFixed(n + 1).split(".");

  return parseFloat(split[0] + "." + split[1].substring(0, n));
};
