
const BUTTON = document.getElementById('btnSearch');
const LOADER = document.getElementById('loader');

BUTTON.addEventListener('click', doSearch);
document.getElementById('fname').addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

function doSearch() {
  const fname = document.getElementById('fname').value.trim();
  const ok = /^[A-Za-z0-9_-]+$/.test(fname);

  if (!ok || !fname) {
    alert('ファイル名は英数字、ハイフン、アンダースコアのみ、50文字以内です');
    return;
  }

  BUTTON.style.display = 'none';
  LOADER.style.display = 'flex';

  // Using the provided Google Apps Script endpoint
  const url = 'https://script.google.com/macros/s/AKfycbzur1Zu2Dz0dpmDu0N_McEBVeSEJED2sYq2R9DIE0qGHGoB5HtuoX3TKrOpRTotmVBCCA/exec?name=' + encodeURIComponent(fname);

  fetch(url)
    .then(res => res.json())
    .then(json => {
      const resDiv = document.getElementById('result');
      resDiv.innerHTML = '';
      if (json.found) {
        resDiv.innerHTML = `
          <p style="margin-bottom: 10px; font-weight: bold; color: var(--color-text-main);">${json.name}</p>
          <a href="${json.downloadUrl}" class="download-button" download>音声をダウンロード</a>
          <audio controls src="${json.downloadUrl}" style="width: 100%; margin-top: 15px;"></audio>
        `;
      } else {
        resDiv.innerHTML = '<p style="color: var(--color-accent-2);">ファイルが見つかりません。ファイル名を確認してください。</p>';
      }
    })
    .catch(err => {
      alert('通信エラー:' + err);
      BUTTON.style.display = 'inline-block'; // Show button again on error
    })
    .finally(() => {
      LOADER.style.display = 'none';
      if (document.getElementById('result').innerHTML === '') {
          BUTTON.style.display = 'inline-block'; // Show button if no result (though catch/else should handle it)
      }
       // If result is found, button stays hidden? The original code didn't reshow button on success.
       // But user might want to search again.
       BUTTON.style.display = 'inline-block';
    });
}
