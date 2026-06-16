let selectedAlgo = 'bfs';
let routeLayers = [];
let exploreMarkers = [];
let startMarker = null;
let endMarker = null;
let animRunning = false;
let stopFlag = false;
let animTimers = [];

function selectAlgo(algo, button) {
  selectedAlgo = algo;

  document.querySelectorAll('.algo-btn').forEach((btn) => {
    btn.className = 'algo-btn';
  });

  button.classList.add(`active-${algo}`);
}

function checkReady() {
  const start = document.getElementById('sel-start').value;
  const end = document.getElementById('sel-end').value;

  document.getElementById('btn-run').disabled = !(start && end && start !== end);
}

function setStatus(text, active = false, color = '') {
  const pulse = document.getElementById('pulse');

  pulse.className = `pulse-dot ${active ? color : 'idle'}`;
  document.getElementById('status-text').textContent = text;
}

function setStepCounter(text) {
  document.getElementById('step-counter').textContent = text;
}

function clearAnimTimers() {
  animTimers.forEach((timer) => clearTimeout(timer));
  animTimers = [];
}

function stopAnimation() {
  stopFlag = true;
  animRunning = false;

  clearAnimTimers();

  document.getElementById('btn-stop').classList.remove('visible');
  document.getElementById('btn-run').disabled = false;

  setStatus('Animasi dihentikan.', false);
}

function resetAll() {
  stopAnimation();

  routeLayers.forEach((layer) => map.removeLayer(layer));
  routeLayers = [];

  exploreMarkers.forEach((layer) => map.removeLayer(layer));
  exploreMarkers = [];

  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);

  startMarker = null;
  endMarker = null;

  NODES.forEach((node, index) => {
    if (nodeMarkers[index]) {
      nodeMarkers[index].setIcon(nodeIcon('#888780', 13));
    }
  });

  document.getElementById('sel-start').value = '';
  document.getElementById('sel-end').value = '';
  document.getElementById('empty-state').style.display = 'block';
  document.getElementById('result').style.display = 'none';
  document.getElementById('live-panel').classList.remove('active');
  document.getElementById('btn-run').disabled = true;

  setStatus('Pilih lokasi awal dan tujuan untuk memulai.', false);
  setStepCounter('');
}

function markNode(nodeId, color, size = 7, ring = false) {
  if (nodeMarkers[nodeId]) {
    nodeMarkers[nodeId].setIcon(nodeIcon(color, Math.max(size, 12), ring));
    return;
  }

  const marker = L.marker([NODES[nodeId].lat, NODES[nodeId].lng], {
    icon: nodeIcon(color, size, ring),
    interactive: false,
  }).addTo(map);

  exploreMarkers.push(marker);
}

function animateAlgo(steps, algoName, totalNodes) {
  return new Promise((resolve) => {
    if (stopFlag) {
      resolve();
      return;
    }

    const delay = parseInt(document.getElementById('sel-speed').value, 10);
    const color = algoName === 'bfs' ? COLOR_BFS_EXPLORE : COLOR_ASTAR_EXPLORE;
    const barEl = document.getElementById(`${algoName}-bar`);
    const visitedEl = document.getElementById(`${algoName}-visited`);
    const queueEl = document.getElementById(algoName === 'bfs' ? 'bfs-queue' : 'astar-fval');

    document.getElementById(`${algoName}-live`).style.display = 'block';

    let visitCount = 0;
    let stepIndex = 0;

    const processStep = () => {
      if (stopFlag || stepIndex >= steps.length) {
        resolve();
        return;
      }

      const step = steps[stepIndex++];

      if (step.type === 'start') {
        markNode(step.node, color, 12);
        setStepCounter(`${algoName.toUpperCase()} — langkah ${stepIndex}/${steps.length}`);
        setStatus(`${algoName.toUpperCase()}: Mulai dari "${NODES[step.node].name}"`, true, algoName === 'bfs' ? '' : 'orange');
      }

      if (step.type === 'visit') {
        visitCount++;
        markNode(step.node, color, 7);

        const percent = Math.min(100, Math.round((visitCount / totalNodes) * 100));
        barEl.style.width = `${percent}%`;
        visitedEl.textContent = `${visitCount} node dikunjungi`;

        if (algoName === 'bfs') {
          queueEl.textContent = `antrian: ${step.queueLen || 0}`;
        } else {
          queueEl.textContent = `f: ${step.fval || '—'}`;
        }

        setStepCounter(`${algoName.toUpperCase()} — kunjungi node ${visitCount}`);
        setStatus(`${algoName.toUpperCase()}: Mengunjungi jaringan jalan OSM`, true, algoName === 'bfs' ? '' : 'orange');
      }

      if (step.type === 'found') {
        barEl.style.width = '100%';
        setStatus(`${algoName.toUpperCase()}: Tujuan ditemukan! Jarak: ${step.cost} km`, true, algoName === 'bfs' ? '' : 'orange');
        setStepCounter(`${algoName.toUpperCase()} — selesai`);
        resolve(step);
        return;
      }

      const timer = setTimeout(processStep, delay);
      animTimers.push(timer);
    };

    processStep();
  });
}

async function drawFinalPath(nodePath, color, dashed = false) {
  const coordinates = nodePath.map((id) => [NODES[id].lat, NODES[id].lng]);

  if (coordinates.length < 2) return null;

  const line = L.polyline(coordinates, {
    color,
    weight: dashed ? 4 : 6,
    opacity: 0.94,
    dashArray: dashed ? '12,6' : null,
  }).addTo(map);

  routeLayers.push(line);

  nodePath.forEach((nodeId) => markNode(nodeId, color, 9));

  return line;
}
