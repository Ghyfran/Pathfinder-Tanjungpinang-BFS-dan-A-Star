function heuristic(a, b) {
    const nodeA = NODES[a];
    const nodeB = NODES[b];

    const deltaLat = (nodeA.lat - nodeB.lat) * 111.32;
    const avgLatRad = ((nodeA.lat + nodeB.lat) / 2) * (Math.PI / 180);
    const deltaLng = (nodeA.lng - nodeB.lng) * 111.32 * Math.cos(avgLatRad);

    return Math.sqrt((deltaLat * deltaLat) + (deltaLng * deltaLng));
}
