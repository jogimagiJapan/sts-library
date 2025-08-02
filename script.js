// DOM要素の取得
const fileNameInput = document.getElementById('fileNameInput');
const searchButton = document.getElementById('searchButton');
const resultsDiv = document.getElementById('results');
const messageDiv = document.getElementById('message');

// ここに、最新のGoogle Apps ScriptのWebアプリURLを貼り付けます
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbypLBA4-B7oSAMM5_vCAqmmFl2Lsu7aZaInLM0odGRTtKxggolYARvzghLkP563BbPFQg/exec'; // ★★★重要：この部分をGASの新しいURLに置き換える★★★

// 検索ボタンクリック時の処理
searchButton.addEventListener('click', performSearch);

// 入力ボックスでEnterキーが押された時の処理
fileNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// 検索実行関数
async function performSearch() {
    messageDiv.innerHTML = ''; // 以前のメッセージをクリア
    resultsDiv.innerHTML = ''; // 以前の結果をクリア

    let fileName = fileNameInput.value.trim();

    // 入力値のバリデーション
    if (fileName === '') {
        displayMessage('ファイル名を入力してください。', 'error');
        return;
    }

    // ファイル名に使用できない文字のバリデーション (英数字, ハイフン, アンダースコアのみ許可)
    const invalidCharsRegex = /[^a-zA-Z0-9_-]/;
    if (invalidCharsRegex.test(fileName)) {
        displayMessage('ファイル名には英数字、ハイフン、アンダースコアのみ使用できます。', 'error');
        return;
    }

    if (fileName.length > 50) {
        displayMessage('ファイル名は50文字以内で入力してください。', 'error');
        return;
    }

    // .wav拡張子自動付加 (フロントエンドで付加)
    if (!fileName.toLowerCase().endsWith('.wav')) {
        fileName += '.wav';
    }

    displayMessage('検索中...', 'info');

    try {
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            mode: 'cors', // CORS対応のため必要
            headers: {
                'Content-Type': 'application/json', // JSONデータを送信することを指定
            },
            body: JSON.stringify({ fileName: fileName }), // ファイル名をJSON形式で送信
        });

        // HTTPステータスコードが200番台以外の場合、エラーをスロー
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // レスポンスをJSONとして解析

        if (data.found) {
            displayMessage(`ファイル「${data.fileName}」が見つかりました！`, 'info');
            // displayResults(data.fileName, data.webViewLink, data.downloadLink); // コメントアウト
        } else {
            displayMessage(data.message, 'error'); // ファイルが見つからないなどのメッセージを表示
        }

    } catch (error) {
        console.error('検索中にエラーが発生しました:', error);
        displayMessage('検索中にエラーが発生しました。時間を置いて再度お試しください。', 'error');
    }
}

// 検索結果を表示する関数 - ★一時的にコメントアウトするか、空にする★
// 今回はdisplayMessageで結果を出すので、この関数は使われません
/*
function displayResults(fileName, webViewLink, downloadLink) {
    resultsDiv.innerHTML = ''; 
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    const fileNameElement = document.createElement('h3');
    fileNameElement.textContent = fileName;
    const audioControls = document.createElement('div');
    audioControls.classList.add('audio-controls');
    const audioPlayer = document.createElement('audio');
    audioPlayer.controls = true;
    audioPlayer.src = webViewLink;
    audioPlayer.type = 'audio/wav';
    const downloadLinkElement = document.createElement('a');
    downloadLinkElement.href = downloadLink;
    downloadLinkElement.textContent = 'ダウンロード';
    downloadLinkElement.classList.add('download-link');
    downloadLinkElement.setAttribute('download', fileName);
    audioControls.appendChild(audioPlayer);
    audioControls.appendChild(downloadLinkElement);
    resultItem.appendChild(fileNameElement);
    resultItem.appendChild(audioControls);
    resultsDiv.appendChild(resultItem);
}
*/

// メッセージを表示する関数 (変更なし)
function displayMessage(message, type) {
    messageDiv.innerHTML = '';
    if (message) {
        messageDiv.textContent = message;
        messageDiv.className = 'message-area';
        if (type === 'error') {
            messageDiv.classList.add('error');
        } else if (type === 'info') {
            messageDiv.classList.add('info');
        }
    }
}