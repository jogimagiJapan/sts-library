const BUTTON = document.getElementById('btnSearch');
BUTTON.addEventListener('click', doSearch);
document.getElementById('fname').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const fnameInput = document.getElementById('fname');
  const fname = fnameInput.value.trim();
  const resDiv = document.getElementById('result');
  resDiv.innerHTML = ''; // 検索結果をクリア

  // ご提供いただいたバリデーションをそのまま利用
  const ok = /^[A-Za-z0-9_-]+$/.test(fname); // // 英数字・_- チェック
  if (!ok || !fname) {
    alert('ファイル名は英数字、ハイフン、アンダースコアのみ、50文字以内です');
    return;
  }

  // ★重要★ ここにGASのウェブアプリのURLを貼り替える
  // 新しいデプロイをするたびに、このURLも更新してください。
  const GAS_WEB_APP_URL = '＜ここにGASのexec URLを貼替＞'; 
  const url = GAS_WEB_APP_URL + '?name=' + encodeURIComponent(fname);

  // 検索中であることを示すメッセージ
  resDiv.innerHTML = '<p>検索中...</p>';

  fetch(url)
    .then(res => res.json()) // ここはそのまま
    .then(json => {
      resDiv.innerHTML = ''; // 検索中のメッセージをクリア
      if (json.found) {
        resDiv.innerHTML = `
          <p>${json.name}</p>
          <p><a href="${json.downloadUrl}" download="${json.name}">ダウンロード</a></p>
        `;
      } else {
        // GASからのメッセージがある場合はそれを使用、ない場合はデフォルトメッセージ
        resDiv.innerHTML = `<p>${json.message || 'ファイルが見つかりません。ファイル名を確認してください。'}</p>`;
      }
    })
    .catch(err => {
      resDiv.innerHTML = ''; // 検索中のメッセージをクリア
      // ご提供いただいたエラーメッセージをそのまま利用
      alert('通信エラー:' + err); 
    });
}