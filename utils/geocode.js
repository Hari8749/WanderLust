// If Node < 18: npm i node-fetch && uncomment next line
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const geocode = async (query, apiKey) => {
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${apiKey}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  const coords = feature.center || feature.geometry?.coordinates; // [lng, lat]
  if (!coords) return null;

  const [lng, lat] = coords;
  return { lng, lat };
};

module.exports = { geocode };