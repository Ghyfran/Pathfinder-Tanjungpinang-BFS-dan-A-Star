async function run() {
  const startKey = document.getElementById('sel-start').value;
  const endKey = document.getElementById('sel-end').value;

  if (!startKey || !endKey || startKey === endKey) return;

  const startIndex = NODES.findIndex((node) => node.key === startKey);
  const endIndex = NODES.findIndex((node) => node.key === endKey);

  if (startIndex < 0 || endIndex < 0) return;

  resetRouteView();
  prepareRunInterface();
  addStartEndMarkers(startIndex, endIndex);

  stopFlag = false;
  animRunning = true;

  document.getElementById('btn-run').disabled = true;
  document.getElementById('btn-stop').classList.add('visible');

  setStatus('Menghitung langkah-langkah algoritma pada jaringan OSM...', true);

  const shouldRunBfs = selectedAlgo === 'bfs' || selectedAlgo === 'both';
  const shouldRunAstar = selectedAlgo === 'astar' || selectedAlgo === 'both';
  const totalNodes = NODES.length;

  const bfsStepsList = shouldRunBfs ? bfsSteps(startIndex, endIndex) : null;
  const astarStepsList = shouldRunAstar ? astarSteps(startIndex, endIndex) : null;

  let bfsFound = null;
  let astarFound = null;

  if (bfsStepsList) {
    setStatus('BFS: Mulai eksplorasi...', true, '');

    bfsFound = await animateAlgo(bfsStepsList, 'bfs', totalNodes);
    if (stopFlag) return;

    if (bfsFound) {
      setStatus('BFS: Menggambar jalur akhir sesuai jaringan OSM...', true);
      await drawFinalPath(bfsFound.path, COLOR_BFS, selectedAlgo === 'both');
    }

    if (stopFlag) return;
  }

  if (shouldRunAstar && astarStepsList) {
    if (shouldRunBfs) {
      await wait(600);
    }

    if (stopFlag) return;

    setStatus('A*: Mulai eksplorasi...', true, 'orange');

    astarFound = await animateAlgo(astarStepsList, 'astar', totalNodes);
    if (stopFlag) return;

    if (astarFound) {
      setStatus('A*: Menggambar jalur akhir sesuai jaringan OSM...', true, 'orange');
      await drawFinalPath(astarFound.path, COLOR_ASTAR, false);
    }

    if (stopFlag) return;
  }

  fitMapToResult([bfsFound, astarFound]);
  finishRunInterface();

  showResults(
    buildResultObject(bfsFound, bfsStepsList),
    buildResultObject(astarFound, astarStepsList),
    NODES[startIndex].name,
    NODES[endIndex].name
  );
}

function resetRouteView() {
  routeLayers.forEach((layer) => map.removeLayer(layer));
  routeLayers = [];

  exploreMarkers.forEach((layer) => map.removeLayer(layer));
  exploreMarkers = [];

  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);

  NODES.forEach((node, index) => {
    if (nodeMarkers[index]) {
      nodeMarkers[index].setIcon(nodeIcon('#888780', 13));
    }
  });
}

function prepareRunInterface() {
  document.getElementById('result').style.display = 'none';
  document.getElementById('live-panel').classList.add('active');
  document.getElementById('bfs-live').style.display = 'none';
  document.getElementById('astar-live').style.display = 'none';
  document.getElementById('bfs-bar').style.width = '0%';
  document.getElementById('astar-bar').style.width = '0%';
  document.getElementById('bfs-visited').textContent = '0 node dikunjungi';
  document.getElementById('astar-visited').textContent = '0 node dikunjungi';
  document.getElementById('empty-state').style.display = 'none';
}

function addStartEndMarkers(startIndex, endIndex) {
  startMarker = L.marker([NODES[startIndex].lat, NODES[startIndex].lng], {
    icon: makeIcon('#D85A30', 'A'),
  })
    .bindPopup(`<b>Start:</b> ${NODES[startIndex].name}`)
    .addTo(map);

  endMarker = L.marker([NODES[endIndex].lat, NODES[endIndex].lng], {
    icon: makeIcon('#854F0B', 'B'),
  })
    .bindPopup(`<b>Tujuan:</b> ${NODES[endIndex].name}`)
    .addTo(map);
}

function fitMapToResult(results) {
  const allPoints = [];

  results.forEach((result) => {
    if (!result) return;

    result.path.forEach((nodeId) => {
      allPoints.push([NODES[nodeId].lat, NODES[nodeId].lng]);
    });
  });

  if (allPoints.length) {
    map.fitBounds(L.latLngBounds(allPoints), { padding: [60, 60] });
  }
}

function finishRunInterface() {
  animRunning = false;

  document.getElementById('btn-stop').classList.remove('visible');
  document.getElementById('btn-run').disabled = false;

  setStatus('Selesai! Rute ditemukan.', false);
  setStepCounter('');
}

function buildResultObject(foundStep, stepsList) {
  if (!foundStep || !stepsList) return null;

  return {
    path: foundStep.path,
    cost: foundStep.cost,
    order: stepsList
      .filter((step) => step.type === 'visit')
      .map((step) => step.node),
  };
}

function wait(duration) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, duration);
    animTimers.push(timer);
  });
}
