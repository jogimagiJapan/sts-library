const BUTTON = document.getElementById('btnSearch');
BUTTON.addEventListener('click', doSearch);
document.getElementById('fname').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const fname = document.getElementById('fname').value.trim();
  const ok = /^[A-Za-z0-9_-]+$/.test(fname); // // 英数字・_- チェック
  if (!ok || !fname) {
    alert('ファイル名は英数字、ハイフン、アンダースコアのみ、50文字以内です');
    return;
  }
  const url = 'https://script.google.com/macros/s/AKfycbwr0QhtsvSnasWULkwM_8PIyv5ifJpQEuAbssUPIEyDLatVOwnh97cL0uajBfwE15m5bQ/exec?name=' + encodeURIComponent(fname);
  fetch(url)
    .then(res => res.json())
    .then(json => {
      const resDiv = document.getElementById('result');
      resDiv.innerHTML = '';
      if (json.found) {
        resDiv.innerHTML = `
          <p>${json.name}</p>
          <audio controls src="${json.playUrl}"></audio>
          <p><a href="${json.downloadUrl}" download>ダウンロード</a></p>
        `;
      } else {
        resDiv.innerHTML = '<p>ファイルが見つかりません。ファイル名を確認してください。</p>';
      }
    })
    .catch(err => {
      alert('通信エラー:' + err);
    });
}
