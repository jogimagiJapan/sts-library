// GAS 本体: /gas/Code.gs
// ウェブアプリとして再デプロイし、URL が変わったらこの定数を更新する。
const API_URL = 'https://script.google.com/macros/s/AKfycbwwqKocq-PCZLdZtjtsvtcfv6dc82ijrKdqiVCFKPZq8TBnKPhGuKloPO4TAUEHiA-F/exec';

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 20000;

const FORM = document.getElementById('searchForm');
const BUTTON = document.getElementById('btnSearch');
const LOADER = document.getElementById('loader');
const INPUT = document.getElementById('fname');
const RESULT = document.getElementById('result');
const STATUS = document.getElementById('status');
const LEAD = document.getElementById('lead-text');

const DEFAULT_LEAD = 'あなたの音を探してください';

let searchToken = 0;
let currentObjectUrl = null;

FORM.addEventListener('submit', function (e) {
  e.preventDefault();
  doSearch({ poll: false });
});

const fileParam = new URLSearchParams(window.location.search).get('file');
if (fileParam) {
  INPUT.value = normalizeId(fileParam);
  setLead('QRから音を探しています…', true);
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

function setLead(text, searching) {
  if (!LEAD) return;
  LEAD.textContent = text;
  LEAD.classList.toggle('is-searching', !!searching);
}

function setSearching(isSearching) {
  BUTTON.disabled = isSearching;
  BUTTON.hidden = isSearching;
  LOADER.hidden = !isSearching;
  document.body.classList.toggle('is-busy', isSearching);
}

function clearFeedback() {
  STATUS.innerHTML = '';
  RESULT.innerHTML = '';
  document.body.classList.remove('has-result');
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

function showMessage(text, tone) {
  RESULT.innerHTML = '';
  document.body.classList.remove('has-result');
  if (tone === 'wait') {
    document.body.classList.add('is-busy');
  }
  const cls = tone === 'error' ? ' is-error' : tone === 'wait' ? ' is-wait' : '';
  STATUS.innerHTML = '<p class="status-message' + cls + '">' + text + '</p>';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPlayer(data, blob) {
  revokeAudioUrl();
  currentObjectUrl = URL.createObjectURL(blob);
  const safeName = String(data.name || 'sound.wav').replace(/[^\w.-]/g, '_');
  const displayId = escapeHtml(normalizeId(data.name || INPUT.value));

  STATUS.innerHTML = '';
  RESULT.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML =
    '<div class="card-header"></div>' +
    '<div class="card-body result-body">' +
      '<h3>あなたの音が見つかりました</h3>' +
      '<p class="result-id">' + displayId + '</p>' +
      '<audio class="audio-player" controls playsinline preload="auto" src="' + currentObjectUrl + '"></audio>' +
      '<div class="btn-container-small">' +
        '<a class="download-link" href="' + currentObjectUrl + '" download="' + safeName + '">ダウンロード</a>' +
      '</div>' +
    '</div>';
  RESULT.appendChild(card);
  document.body.classList.add('has-result');

  setTimeout(function () {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 120);
}

async function doSearch(options) {
  const poll = !!(options && options.poll);
  const fname = normalizeId(INPUT.value);
  INPUT.value = fname;

  if (!isValidId(fname)) {
    setLead(DEFAULT_LEAD, false);
    showMessage(
      fname
        ? 'IDは英数字・ハイフン・アンダースコアのみ、50文字以内です'
        : '音声IDを入力するか、会場のQRコードを読み取ってください',
      'error'
    );
    INPUT.focus();
    return;
  }

  const token = ++searchToken;
  revokeAudioUrl();
  setSearching(true);
  clearFeedback();
  if (!poll) {
    setLead('音を探しています…', true);
  }

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
          setLead('再生して、あなたの音を聴いてください', false);
          renderPlayer(data, base64ToBlob(data.audioBase64, mime));
          return;
        }
        setLead(DEFAULT_LEAD, false);
        showMessage('音声データを取得できませんでした。もう一度お試しください。', 'error');
        return;
      }

      const elapsed = Date.now() - started;
      if (!poll || elapsed >= POLL_MAX_MS) {
        setLead(DEFAULT_LEAD, false);
        showMessage('ファイルが見つかりませんでした。IDをもう一度ご確認ください。', 'error');
        return;
      }

      setLead('保存が完了するまで待っています…', true);
      showMessage('保存中です。そのままお待ちください…', 'wait');
      await sleep(POLL_INTERVAL_MS);
    }
  } catch (err) {
    if (token !== searchToken) return;
    console.error(err);
    setLead(DEFAULT_LEAD, false);
    showMessage('通信エラーが発生しました。電波の良い場所でもう一度お試しください。', 'error');
  } finally {
    if (token === searchToken) {
      setSearching(false);
    }
  }
}
