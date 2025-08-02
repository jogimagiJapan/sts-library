const BUTTON = document.getElementById('btnSearch');
BUTTON.addEventListener('click', doSearch);
document.getElementById('fname').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const fname = document.getElementById('fname').value.trim();
  const ok = /^[A-Za-z0-9_-]{1,50}$/.test(fname);
  if (!ok || !fname) {
    alert('ファイル名は英数字、ハイフン、アンダースコアのみ、50文字以内です');
    return;
  }

  const url = 'https://script.google.com/macros/s/AKfycbzBIPEjEc8XTcs-gA1T9BDmYR7DSp75fx-0Yys0PSPplwKQWoarqtrv1zTD7w4BY3Kr4A/exec?name=' + encodeURIComponent(fname);

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
