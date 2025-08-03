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

  // バリデーションの強化
  if (!fname) {
    alert('ファイル名を入力してください。');
    return;
  }
  // 英数字、ハイフン、アンダースコアのみ許可
  // MaxlengthはHTMLに任せるが、念のためJSでも文字数チェック
  const ok = /^[A-Za-z0-9_-]+$/.test(fname);
  if (!ok) {
    alert('ファイル名には英数字、ハイフン、アンダースコアのみ使用できます。');
    return;
  }
  if (fname.length > 50) { // HTMLのmaxlengthが働かないブラウザ向け
    alert('ファイル名は50文字以内で入力してください。');
    return;
  }

  // ★重要★ ここにGASのウェブアプリのURLを貼り替える
  // 新しいデプロイをするたびに、このURLも更新してください。
  const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyyGE5wA0gTqfCO2kPLopR5nQZM0SXVFUT7rXmJf72cE1PUxWgaxuZAV1Cl4a2z3UKpKQ/exec'; 
  const url = GAS_WEB_APP_URL + '?name=' + encodeURIComponent(fname);

  // 検索中であることを示すメッセージ
  resDiv.innerHTML = '<p>検索中...</p>';

  fetch(url)
    .then(res => {
      // HTTPステータスコードが2xx以外の場合も、JSONとして解析を試みる（GASからのエラーレスポンスを受け取るため）
      if (!res.ok) {
        // HTTPエラーの場合もレスポンスボディをJSONとして読み取って、より詳細なエラーメッセージを出す
        return res.json().then(errorData => {
            throw new Error(`HTTPエラー ${res.status}: ${errorData.message || res.statusText}`);
        });
      }
      return res.json();
    })
    .then(json => {
      resDiv.innerHTML = ''; // 検索中のメッセージをクリア
      if (json.found) {
        resDiv.innerHTML = `
          <p>${json.name}</p>
          <p><a href="${json.downloadUrl}" download="${json.name}">ダウンロード</a></p>
        `;
      } else {
        resDiv.innerHTML = `<p>${json.message || 'ファイルが見つかりません。ファイル名を確認してください。'}</p>`;
      }
    })
    .catch(err => {
      resDiv.innerHTML = ''; // 検索中のメッセージをクリア
      console.error('通信エラー:', err); // 開発者向けの詳細なエラーログ
      alert('通信エラーが発生しました。時間を置いて再度お試しください。');
    });
}