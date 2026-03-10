function doGet(e) {
  const name = e.parameter.name;
  
  // 検索ワードがない場合は空の結果を返す
  if (!name) {
    return ContentService.createTextOutput(JSON.stringify({found: false}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ファイル名（完全一致）で検索
  const fileName = name + '.wav'; 
  const folderId = '1NFTXy-gqHPxHIPvDl01yVBl_XQx2qLmW'; // 指定フォルダID
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByName(fileName);

  if (files.hasNext()) {
    const file = files.next();
    // ファイルIDのみを返す（セキュリティ設定が「全員」ならこれで再生・DL可能）
    const result = {
      found: true,
      name: fileName,
      id: file.getId()
    };
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
    // 見つからなかった場合
    return ContentService.createTextOutput(JSON.stringify({found: false}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}