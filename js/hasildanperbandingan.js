function showResults(bfsResult, astarResult, fromName, toName) {
  const resultEl = document.getElementById('result');

  let html = `
    <div class="panel-sec">
      <h3>Hasil Rute</h3>
      <div style="font-size:11px;color:#aaa;margin-bottom:10px;">
        ${fromName}<br />→ ${toName}
      </div>
  `;

  if (selectedAlgo === 'bfs' || selectedAlgo === 'both') {
    html += renderCard('bfs', bfsResult, astarResult);
  }

  if (selectedAlgo === 'astar' || selectedAlgo === 'both') {
    html += renderCard('astar', astarResult, bfsResult);
  }

  html += '</div>';

  if (selectedAlgo === 'both' && bfsResult && astarResult) {
    html += renderComp(bfsResult, astarResult);
  }

  resultEl.innerHTML = html;
  resultEl.style.display = 'flex';
  resultEl.style.flexDirection = 'column';
}

function renderCard(algo, result, otherResult) {
  if (!result) {
    return '<div class="rcard"><div style="color:#aaa;font-size:12px;">Rute tidak ditemukan.</div></div>';
  }

  const color = algo === 'bfs' ? COLOR_BFS : COLOR_ASTAR;
  const label = algo === 'bfs' ? 'BFS' : 'A*';
  const description = algo === 'bfs'
    ? 'Melebar mengikuti koneksi jalan OSM'
    : 'Terarah via heuristik pada jaringan OSM';
  const isBetter = otherResult && result.cost <= otherResult.cost && selectedAlgo === 'both';
  const pathString = result.path
    .filter((_, index) => index === 0 || index === result.path.length - 1 || NODES[result.path[index]].key)
    .map((id) => NODES[id].name)
    .join('<br><span style="color:#ccc">↓</span> ');

  return `
    <div class="rcard" style="border-left:3px solid ${color};">
      <div class="atag" style="color:${color}">
        <span class="dot" style="background:${color}"></span>${label}
      </div>

      <div class="metric">
        <div class="lbl">Jarak (OSM graph)</div>
        <div class="val">
          ${result.cost} km ${isBetter ? '<span class="badge">lebih pendek</span>' : ''}
        </div>
      </div>

      <div class="metric">
        <div class="lbl">Node dieksplorasi</div>
        <div class="val" style="font-size:16px;">${result.order.length}</div>
        <div class="sub">${description}</div>
      </div>

      <div style="margin-top:8px;">
        <div class="lbl" style="margin-bottom:4px;">Jalur utama</div>
        <div style="font-size:11px;color:#666;line-height:1.9;border-left:2px solid ${color};padding-left:8px;">
          ${pathString}
        </div>
      </div>
    </div>
  `;
}

function renderComp(bfsResult, astarResult) {
  const bfsDistanceWin = bfsResult.cost <= astarResult.cost;
  const astarNodeWin = astarResult.order.length <= bfsResult.order.length;

  return `
    <div class="panel-sec">
      <h3>Perbandingan</h3>

      <div class="comp-row">
        <span class="clabel">Jarak</span>
        <div class="cvals">
          <div class="cval ${bfsDistanceWin ? 'win' : ''}">
            <div class="v" style="color:${bfsDistanceWin ? COLOR_BFS : '#2c2c2a'}">${bfsResult.cost} km</div>
            <div class="n">BFS</div>
          </div>
          <div class="cval ${!bfsDistanceWin ? 'win' : ''}">
            <div class="v" style="color:${!bfsDistanceWin ? COLOR_ASTAR : '#2c2c2a'}">${astarResult.cost} km</div>
            <div class="n">A*</div>
          </div>
        </div>
      </div>

      <div class="comp-row">
        <span class="clabel">Node dieksplorasi</span>
        <div class="cvals">
          <div class="cval ${!astarNodeWin ? 'win' : ''}">
            <div class="v">${bfsResult.order.length}</div>
            <div class="n">BFS</div>
          </div>
          <div class="cval ${astarNodeWin ? 'win' : ''}">
            <div class="v">${astarResult.order.length}</div>
            <div class="n">A*</div>
          </div>
        </div>
      </div>

      <div class="note">
        <span style="color:${COLOR_BFS};font-weight:600;">■ BFS</span>
        dan
        <span style="color:${COLOR_ASTAR};font-weight:600;">■ A*</span>
        berjalan pada graph jalan dari data OSM. Garis berwarna hanya menampilkan rute akhir, bukan cabang eksplorasi.
      </div>
    </div>
  `;
}
