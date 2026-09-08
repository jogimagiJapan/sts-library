// GAS は注文サイトと共用（order/code.gs をウェブアプリとしてデプロイ）。
// URL が変わったらこの定数を更新する。
const API_URL = 'https://script.google.com/macros/s/AKfycbwwqKocq-PCZLdZtjtsvtcfv6dc82ijrKdqiVCFKPZq8TBnKPhGuKloPO4TAUEHiA-F/exec';

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 20000;

const BUTTON = document.getElementById('btnSearch');
const LOADER = document.getElementById('loader');
const INPUT = document.getElementById('fname');
const RESULT = document.getElementById('result');

let searchToken = 0;
let currentObjectUrl = null;

BUTTON.addEventListener('click', function () {
  doSearch({ poll: false });
});

INPUT.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') doSearch({ poll: false });
});

const fileParam = new URLSearchParams(window.location.search).get('file');
if (fileParam) {
  INPUT.value = normalizeId(fileParam);
  doSearch({ poll: true });
}

function normalizeId(raw) {
  return String(raw || '').trim().replace(/\.wav$/i, '');
}

function isValidId(id) {
  return id.length > 0 && id.length <= 50 && /^[A-Za-z0-9_-]+$/.test(id);
}

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function setSearching(isSearching) {
  BUTTON.disabled = isSearching;
  BUTTON.style.display = isSearching ? 'none' : 'inline-block';
  LOADER.style.display = isSearching ? 'inline-block' : 'none';
}

function revokeAudioUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function base64ToBlob(base64, mimeType) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType || 'audio/wav' });
}

async function fetchLibraryFile(id) {
  const res = await fetch(API_URL + '?name=' + encodeURIComponent(id));
  if (!res.ok) {
    throw new Error('HTTP ' + res.status);
  }
  return res.json();
}

function showMessage(text) {
  RESULT.innerHTML = '<p class="status-message">' + text + '</p>';
}

function renderPlayer(data, blob) {
  revokeAudioUrl();
  currentObjectUrl = URL.createObjectURL(blob);
  const safeName = String(data.name || 'sound.wav').replace(/[^\w.-]/g, '_');

  RESULT.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML =
    '<div class="card-header"></div>' +
    '<div class="card-body result-body">' +
      '<h3>あなたの音が見つかりました</h3>' +
      '<audio class="audio-player" controls playsinline preload="auto" src="' + currentObjectUrl + '"></audio>' +
      '<div class="btn-container-small">' +
        '<a class="download-link" href="' + currentObjectUrl + '" download="' + safeName + '">ダウンロード</a>' +
      '</div>' +
    '</div>';
  RESULT.appendChild(card);

  setTimeout(function () {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

async function doSearch(options) {
  const poll = !!(options && options.poll);
  const fname = normalizeId(INPUT.value);
  INPUT.value = fname;

  if (!isValidId(fname)) {
    showMessage('ファイル名は英数字、ハイフン、アンダースコアのみ、50文字以内です');
    return;
  }

  const token = ++searchToken;
  revokeAudioUrl();
  setSearching(true);
  RESULT.innerHTML = '';

  const started = Date.now();

  try {
    while (token === searchToken) {
      const data = await fetchLibraryFile(fname);

      if (token !== searchToken) return;

      if (data && data.found) {
        if (data.audioBase64) {
          const mime = data.mimeType && String(data.mimeType).indexOf('audio/') === 0
            ? data.mimeType
            : 'audio/wav';
          renderPlayer(data, base64ToBlob(data.audioBase64, mime));
          return;
        }
        showMessage('音声データを取得できませんでした。');
        return;
      }

      const elapsed = Date.now() - started;
      if (!poll || elapsed >= POLL_MAX_MS) {
        showMessage('ファイルが見つかりませんでした。');
        return;
      }

      showMessage('保存中…');
      await sleep(POLL_INTERVAL_MS);
    }
  } catch (err) {
    if (token !== searchToken) return;
    console.error(err);
    showMessage('通信エラーが発生しました。');
  } finally {
    if (token === searchToken) {
      setSearching(false);
    }
  }
}
