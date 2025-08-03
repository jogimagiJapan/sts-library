// オシロスコープ風アニメーション
const canvas = document.getElementById('oscilloscope');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let t = 0;
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'lime'; // 緑色の線
  ctx.lineWidth = 2;

  ctx.beginPath();
  for (let x = 0; x < canvas.width; x++) {
    const y = canvas.height / 2 + Math.sin((x + t) * 0.05) * 40; // 波形描画
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  t += 2; // 波の進み速度
  requestAnimationFrame(draw);
}
draw();

// 検索処理
const BUTTON = document.getElementById('btnSearch');
BUTTON.addEventListener('click', doSearch);
document.getElementById('fname').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const fname = document.getElementById('fname').value.trim();
  const ok = /^[A-Za-z0-9_-]+$/.test(fname); // 英数字・-_チェック
  if (!ok || !fname) {
    alert('ファイル名は英数字、ハイフン、アンダースコアのみ、50文字以内です');
    return;
  }

  const url = 'https://script.google.com/macros/s/AKfycbzur1Zu2Dz0dpmDu0N_McEBVeSEJED2sYq2R9DIE0qGHGoB5HtuoX3TKrOpRTotmVBCCA/exec?name='
    + encodeURIComponent(fname);

  fetch(url)
    .then(res => res.json())
    .then(json => {
      const resDiv = document.getElementById('result');
      resDiv.innerHTML = '';
      if (json.found) {
        resDiv.innerHTML = `
          <p>${json.name}</p>
          <a href="${json.downloadUrl}" class="download-button" download>音声をダウンロード</a>
        `;
      } else {
        resDiv.innerHTML = '<p>ファイルが見つかりません。ファイル名を確認してください。</p>';
      }
    })
    .catch(err => {
      alert('通信エラー:' + err);
    });
}
