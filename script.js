const BUTTON = document.getElementById('btnSearch');
BUTTON.addEventListener('click', doSearch);
document.getElementById('fname').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// Google DriveのURLをaudio再生できる形式に変換
function convertToPlayableUrl(originalUrl) {
  const match = originalUrl.match(/\/d\/([a-zA-Z0-9_-]+)\//); // /d/◯◯◯/ からID抽出
  if (!match) return originalUrl; // IDが取れないときはそのまま返す
  const fileId = match[1]; // ファイルID
  return `https://drive.google.com/uc?export=download&id=${fileId}`; // 再生可能形式に変換
}

function doSearch() {
  const fname = document.getElementById('fname').value.trim();
  const ok = /^[A-Za-z0-9_-]{1,50}$/.test(fname); // 英数字・_- のみ、50文字以内
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
        // GASから返ってきたURLをaudio用に変換
        const playableUrl = convertToPlayableUrl(json.playUrl);

        resDiv.innerHTML = `
          <p>${json.name}</p>
          <audio controls src="${playableUrl}"></audio>  <!-- 再生用 -->
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
