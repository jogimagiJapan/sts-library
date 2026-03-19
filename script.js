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
const API_URL = 'https://script.google.com/macros/s/AKfycbwwqKocq-PCZLdZtjtsvtcfv6dc82ijrKdqiVCFKPZq8TBnKPhGuKloPO4TAUEHiA-F/exec';

const BUTTON = document.getElementById('btnSearch');
const LOADER = document.getElementById('loader');
const INPUT = document.getElementById('fname');
const RESULT = document.getElementById('result');

BUTTON.addEventListener('click', doSearch);
INPUT.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// URLパラメータから 'file' を取得して自動入力
const urlParams = new URLSearchParams(window.location.search);
const fileParam = urlParams.get('file');
if (fileParam) {
  INPUT.value = fileParam;
  // 自動的に検索も実行（UX向上のため）
  doSearch();
}

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
  // 再生用: iframe埋め込みプレイヤーを使用（Google Driveの直リンク仕様変更による再生エラーを回避）
  const playUrl = `https://drive.google.com/file/d/${data.id}/preview`;
  // ダウンロード用: export=download
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${data.id}`;

  // UI構築
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
      <div class="card-header"></div>
      <div class="card-body result-body">
        <h3>あなたの音が見つかりました</h3>
        
        <!-- 再生プレイヤーを大きく配置 -->
        <iframe src="${playUrl}" width="100%" height="80" style="border: none; border-radius: 12px; max-width: 400px; margin: 10px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" allow="autoplay"></iframe>

        <div class="btn-container-small">
            <a href="${downloadUrl}" class="download-link" target="_blank" rel="noopener noreferrer">ダウンロード</a>
        </div>
      </div>
    `;
  RESULT.appendChild(card);

  // 再生プレイヤー（カード）が表示されたらそこへ自動スクロール
  setTimeout(() => {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}
