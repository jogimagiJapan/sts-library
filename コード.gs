/**
 * SEW THE SOUND Library 検索（参照用）
 *
 * 本番のウェブアプリは注文サイトと共用の code.gs をデプロイする。
 * このファイルだけを貼ると注文 API が消えるので使わないこと。
 *
 * Drive の固定フォルダから {name}.wav を探し、3秒音声を JSON で返す。
 */

var FOLDER_ID = '1NFTXy-gqHPxHIPvDl01yVBl_XQx2qLmW';

function doGet(e) {
  try {
    var name = (e && e.parameter && e.parameter.name) ? String(e.parameter.name) : '';
    name = name.replace(/^\s+|\s+$/g, '').replace(/\.wav$/i, '');

    if (!name) {
      return json_({ found: false });
    }

    var fileName = name + '.wav';
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var files = folder.getFilesByName(fileName);

    if (!files.hasNext()) {
      return json_({ found: false });
    }

    var file = files.next();
    var blob = file.getBlob();
    var mime = blob.getContentType() || 'audio/wav';
    if (mime === 'application/octet-stream') {
      mime = 'audio/wav';
    }

    return json_({
      found: true,
      name: fileName,
      id: file.getId(),
      mimeType: mime,
      audioBase64: Utilities.base64Encode(blob.getBytes())
    });
  } catch (err) {
    return json_({ found: false });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
