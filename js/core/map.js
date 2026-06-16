const COLOR_BFS = '#185FA5';
const COLOR_ASTAR = '#C2410C';
const COLOR_BFS_EXPLORE = '#60A5FA';
const COLOR_ASTAR_EXPLORE = '#F97316';

const map = L.map('map').setView([0.91, 104.47], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);

function makeIcon(color, label) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:34px;
        height:34px;
        border-radius:50%;
        background:${color};
        border:3px solid #fff;
        box-shadow:0 2px 8px rgba(0,0,0,.35);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:13px;
        font-weight:700;
        color:#fff;
      ">${label}</div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function nodeIcon(color, size = 8, ring = false) {
  const style = ring
    ? `border:2px solid ${color};background:#fff;`
    : `background:${color};border:2px solid #fff;`;

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        ${style}
        box-shadow:0 1px 4px rgba(0,0,0,.22);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/* =========================================================
   Layer Jalan dan Marker Lokasi Penting
   ========================================================= */
const baseEdgeLayers = [];

ROAD_WAYS.forEach((segment) => {
  const layer = L.polyline(segment, {
    color: '#c8c3b8',
    weight: 1.5,
    opacity: 0.35,
  }).addTo(map);

  baseEdgeLayers.push(layer);
});

const nodeMarkers = NODES.map((node) => {
  if (!node.key) return null;

  return L.marker([node.lat, node.lng], {
    icon: nodeIcon('#888780', 13),
  })
    .bindTooltip(
      `<b>${node.name}</b><br><span style="color:#888;font-size:10px;">${node.addr || ''}</span>`,
      { direction: 'top', offset: [0, -8] }
    )
    .addTo(map);
});
