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

    // 検索ボタン非表示、ローダー表示
    BUTTON.style.display = 'none';
    LOADER.style.display = 'flex';
    RESULT.innerHTML = ''; // クリア

    // 擬似的な検索処理 (実際のエンドポイントがあればfetchに置き換える)
    // ここではデモとして1.5秒後に結果を表示する
    new Promise((resolve) => setTimeout(resolve, 1500))
        .then(() => {
            // 成功時の処理例
            // 実際には fetch('/api/search?q=' + fname).then(...) 等

            // 結果のダミー表示
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
        <div class="card-header"></div>
        <div class="card-body">
          <h3>${fname}</h3>
          <p>Audio file found.</p>
          <audio controls src="#"></audio>
          <a href="#" class="download-button">Download</a>
        </div>
      `;
            RESULT.appendChild(card);
        })
        .catch(err => {
            alert('通信エラー:' + err);
        })
        .finally(() => {
            // ローダーを非表示に
            LOADER.style.display = 'none';
            // ボタンを再表示
            BUTTON.style.display = 'inline-block';
        });
}
