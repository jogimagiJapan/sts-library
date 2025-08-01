// DOM要素の取得
const fileNameInput = document.getElementById('fileNameInput'); // ファイル名入力ボックス
const searchButton = document.getElementById('searchButton'); // 検索ボタン
const resultsDiv = document.getElementById('results'); // 検索結果を表示するエリア
const messageDiv = document.getElementById('message'); // メッセージを表示するエリア

// ここに、先ほどGoogle Apps ScriptをWebアプリとして公開した際のURLを貼り付けます
// 例: const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec';
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxejX-TLlYai93amvGjmYrI12eNntjf_pxoZ6JEuHR-cpc-owCA-sPP5f7Ih5nIIpTr/exec'; // ★★★重要：この部分をGASのURLに置き換える★★★

// 検索ボタンクリック時の処理
searchButton.addEventListener('click', performSearch); // 検索ボタンがクリックされたらperformSearch関数を実行

// 入力ボックスでEnterキーが押された時の処理
fileNameInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') { // 押されたキーがEnterの場合
        performSearch(); // 検索を実行
    }
});

// 検索実行関数
async function performSearch() {
    messageDiv.innerHTML = ''; // 前回表示されたメッセージをクリア
    resultsDiv.innerHTML = ''; // 前回表示された検索結果をクリア

    let fileName = fileNameInput.value.trim(); // 入力値の前後の空白を削除

    // 入力値のバリデーション
    if (fileName === '') { // 入力が空の場合
        displayMessage('ファイル名を入力してください。', 'error');
        return; // 処理を中断
    }

    // ファイル名に使用できない文字のバリデーション (英数字, ハイフン, アンダースコアのみ許可)
    // 正規表現: ^[a-zA-Z0-9_-]+$ は、文字列の先頭(^)から末尾($)までが、
    // 任意の英字(a-zA-Z)、数字(0-9)、アンダースコア(_)、ハイフン(-)のいずれかである場合にマッチします。
    const invalidCharsRegex = /[^a-zA-Z0-9_-]/;
    if (invalidCharsRegex.test(fileName)) {
        displayMessage('ファイル名には英数字、ハイフン、アンダースコアのみ使用できます。', 'error');
        return;
    }

    if (fileName.length > 50) { // 最大文字数制限
        displayMessage('ファイル名は50文字以内で入力してください。', 'error');
        return;
    }

    // .wav拡張子自動付加 (フロントエンドで付加)
    if (!fileName.toLowerCase().endsWith('.wav')) {
        fileName += '.wav';
    }

    displayMessage('検索中...', 'info'); // 検索中のメッセージを表示

    try {
        // GAS Webアプリへのリクエストを送信
        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST', // POSTメソッドで送信
            mode: 'cors', // CORSモードを使用
            headers: {
                'Content-Type': 'application/json', // リクエストボディがJSON形式であることを指定
            },
            body: JSON.stringify({ fileName: fileName }), // 検索するファイル名をJSON形式で送信
        });

        if (!response.ok) { // レスポンスが正常でなかった場合
            throw new Error(`HTTP error! status: ${response.status}`); // エラーをスロー
        }

        const data = await response.json(); // レスポンスボディをJSONとして解析

        if (data.found) { // ファイルが見つかった場合
            displayResults(data.fileName, data.webViewLink, data.downloadLink); // 結果を表示する関数を呼び出し
            displayMessage('', 'clear'); // 検索中のメッセージをクリア
        } else { // ファイルが見つからなかった場合
            displayMessage(data.message, 'error'); // エラーメッセージを表示
        }

    } catch (error) { // エラーが発生した場合
        console.error('検索中にエラーが発生しました:', error); // コンソールにエラーを出力
        displayMessage('検索中にエラーが発生しました。時間を置いて再度お試しください。', 'error'); // エラーメッセージを表示
    }
}

// 検索結果を表示する関数
function displayResults(fileName, webViewLink, downloadLink) {
    resultsDiv.innerHTML = ''; // 既存の結果をクリア

    const resultItem = document.createElement('div'); // 新しいdiv要素を作成
    resultItem.classList.add('result-item'); // クラスを追加

    const fileNameElement = document.createElement('h3'); // h3要素を作成（ファイル名表示用）
    fileNameElement.textContent = fileName; // ファイル名を設定

    const audioControls = document.createElement('div'); // オーディオコントロール用のdivを作成
    audioControls.classList.add('audio-controls'); // クラスを追加

    const audioPlayer = document.createElement('audio'); // audio要素を作成
    audioPlayer.controls = true; // 再生コントロールを表示
    audioPlayer.src = webViewLink; // 再生する音声ファイルのURLを設定
    audioPlayer.type = 'audio/wav'; // 音声のタイプを指定

    const downloadLinkElement = document.createElement('a'); // a要素を作成（ダウンロードリンク用）
    downloadLinkElement.href = downloadLink; // ダウンロードURLを設定
    downloadLinkElement.textContent = 'ダウンロード'; // リンクのテキスト
    downloadLinkElement.classList.add('download-link'); // クラスを追加
    downloadLinkElement.setAttribute('download', fileName); // ファイル名でダウンロードされるように設定

    audioControls.appendChild(audioPlayer); // オーディオプレイヤーを追加
    audioControls.appendChild(downloadLinkElement); // ダウンロードリンクを追加

    resultItem.appendChild(fileNameElement); // ファイル名を追加
    resultItem.appendChild(audioControls); // オーディオコントロールを追加

    resultsDiv.appendChild(resultItem); // 結果エリアにアイテムを追加
}

// メッセージを表示する関数
function displayMessage(message, type) {
    messageDiv.innerHTML = ''; // メッセージをクリア
    if (message) { // メッセージがある場合のみ表示
        messageDiv.textContent = message; // メッセージを設定
        messageDiv.className = 'message-area'; // 基本クラスを設定
        if (type === 'error') {
            messageDiv.classList.add('error'); // エラーメッセージの場合、エラークラスを追加
        } else if (type === 'info') {
            messageDiv.classList.add('info'); // 情報メッセージの場合、情報クラスを追加
        }
    }
}