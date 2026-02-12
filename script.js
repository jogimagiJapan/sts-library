/* 
  【重要】Google Apps Script (GAS) コード
  以下のコードをGASにデプロイし、ウェブアプリとして公開（全員・匿名アクセス可）してください。
  発行されたURLを、下部の `API_URL` 定数に設定してください。

  function doGet(e) {
    const name = e.parameter.name;
    // パラメータなしのガード
    if (!name) {
      return ContentService.createTextOutput(JSON.stringify({found: false})).setMimeType(ContentService.MimeType.JSON);
    }

    const fileName = name + '.wav'; 
    const folderId = '1NFTXy-gqHPxHIPvDl01yVBl_XQx2qLmW'; // 指定フォルダID
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFilesByName(fileName);

    if (files.hasNext()) {
      const file = files.next();
      // ファイルIDだけ返して、クライアント側でリンク生成するほうが高速かつ安全
      const result = {
        found: true,
        name: fileName,
        id: file.getId()
      };
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({found: false})).setMimeType(ContentService.MimeType.JSON);
    }
  }
*/

// ここにGASのデプロイURLを貼り付けてください
const API_URL = 'YOUR_GAS_DEPLOYMENT_URL_HERE';

const BUTTON = document.getElementById('btnSearch');
const LOADER = document.getElementById('loader');
const INPUT = document.getElementById('fname');
const RESULT = document.getElementById('result');

BUTTON.addEventListener('click', doSearch);
INPUT.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
});

function doSearch() {
    const fname = INPUT.value.trim();
    // 英数字・_- チェック
    const ok = /^[A-Za-z0-9_-]+$/.test(fname);

    if (!ok || !fname) {
        alert('ファイル名は英数字、ハイフン、アンダースコアのみ、50文字以内です');
        return;
    }

    // UI状態更新
    BUTTON.style.display = 'none';
    LOADER.style.display = 'inline-block'; // Ripple用にinline-block/block調整
    RESULT.innerHTML = '';

    // API_URLが設定されていない場合のダミー動作 (デバッグ用)
    if (API_URL === 'YOUR_GAS_DEPLOYMENT_URL_HERE') {
        console.warn('API URL not set. Using mock delay.');
        setTimeout(() => {
            renderResult({
                found: true,
                name: fname + '.wav',
                id: 'MOCK_ID_FOR_DEMO'
            });
            LOADER.style.display = 'none';
            BUTTON.style.display = 'inline-block';
        }, 1500);
        return;
    }

    // 実際の検索
    fetch(`${API_URL}?name=${encodeURIComponent(fname)}`)
        .then(res => res.json())
        .then(data => {
            renderResult(data);
        })
        .catch(err => {
            alert('通信エラーが発生しました: ' + err);
        })
        .finally(() => {
            LOADER.style.display = 'none';
            BUTTON.style.display = 'inline-block';
        });
}

function renderResult(data) {
    if (!data.found && !data.id) { // idチェックも念のため
        RESULT.innerHTML = '<p>ファイルが見つかりませんでした。</p>';
        return;
    }

    // Google Driveの直接リンク形式
    // audioタグ用 (previewではなくdownload URLを使うと再生できるケースが多いが、audioタグとの相性はブラウザによる)
    // 一般的には https://drive.google.com/uc?export=download&id=FILE_ID が使われる
    const srcUrl = `https://drive.google.com/uc?export=download&id=${data.id}`;

    // UI構築
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header"></div>
      <div class="card-body">
        <h3>${data.name}</h3>
        <p>Preview Sound</p>
        <audio controls src="${srcUrl}"></audio>
        
        <div class="btn-container">
            <a href="${srcUrl}" class="download-button" download>DOWNLOAD .WAV</a>
        </div>
      </div>
    `;
    RESULT.appendChild(card);
}
