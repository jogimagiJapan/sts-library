const BUTTON = document.getElementById('btnSearch');
const LOADER = document.getElementById('loader');
BUTTON.addEventListener('click', doSearch);
document.getElementById('fname').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const fname = document.getElementById('fname').value.trim();
  const ok = /^[A-Za-z0-9_-]+$/.test(fname); // 英数字・_- チェック

  if (!ok || !fname) {
    alert('ファイル名は英数字、ハイフン、アンダースコアのみ、50文字以内です');
    return;
  }

  // 検索ボタンを非表示、ローダーを表示
  BUTTON.style.display = 'none';
  LOADER.style.display = 'flex';

  const url = 'https://script.google.com/macros/s/AKfycbzur1Zu2Dz0dpmDu0N_McEBVeSEJED2sYq2R9DIE0qGHGoB5HtuoX3TKrOpRTotmVBCCA/exec?name=' + encodeURIComponent(fname);

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
    })
    .finally(() => {
      // ローダーを非表示にしてボタンを再表示
      LOADER.style.display = 'none';
      BUTTON.style.display = 'inline-block';
    });
}
