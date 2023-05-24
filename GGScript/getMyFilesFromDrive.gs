var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
//2. Current sheet
var sheet = spreadsheet.getActiveSheet();
//3. Get range
var range = sheet.getRange("B2");
//4. Get range value
var folderId = range.getValue();
function main() {
  listAll();
  Browser.msgBox("取得しました。全フォルダーシートを確認してください。");

}
//Get folder in folder 
// Main function 1: List all folders, & write into the current sheet.
function listFolers() {
  getFolderTree(folderId, false);

};

// Main function 2: List all files & folders, & write into the current sheet.
function listAll() {
  getFolderTree(folderId, true);
};

// =================
// Get Folder Tree
function getFolderTree(folderId, listAll) {
  try {
    // Get folder by id
    var parentFolder = DriveApp.getFolderById(folderId);

    // Initialise the sheet
    var file, data, sheet = SpreadsheetApp.getActive().getSheetByName("全フォルダー");

    sheet.clear();
    //sheet.appendRow(["Full Path", "Folder/File", "URL", "Last Updated", "User"]);
    sheet.appendRow(["フールパス", "フォルダ/ファイル名", "ユーザー(デトモ)", "ユーザー(その他)"]);
    var range = sheet.getRange('A1:D1');
    range.setBackground("green");
    var style = SpreadsheetApp.newTextStyle()
      .setFontSize(10)
      .setBold(true)
      .build();

    range.setTextStyle(style);
    //Logger.log(numRows);
    // Get files and folders
    getChildFolders(parentFolder.getName(), parentFolder, data, sheet, listAll);

  } catch (e) {
    Logger.log(e.toString());
  }
};

// Get the list of files and folders and their metadata in recursive mode
function getChildFolders(parentName, parent, data, sheet, listAll) {
  var childFolders = parent.getFolders();

  // List folders inside the folder
  while (childFolders.hasNext()) {
    var childFolder = childFolders.next();
    // Logger.log("Folder Name: " + childFolder.getName());
    var permissions = childFolder.getEditors();// Viewers List : getEditors→getViewers
    let arrayList1 = [];
    let arrayList2 = [];
    for (var i = 0; i < permissions.length; i++) {
      //Email address
      //Detomo
      if (permissions[i].getEmail().includes("detomo.co.jp")) {
        arrayList1.push(permissions[i].getEmail().split("@")[0]);
      } else {
        //Other
        arrayList2.push(permissions[i].getEmail().split("@")[0]);
      }
    }
    data = [
      parentName + "/" + childFolder.getName(),
      childFolder.getName(),
      //childFolder.getUrl(),
      //childFolder.getLastUpdated(),
      arrayList1.toString(),
      arrayList2.toString()
    ];
    // Write
    sheet.appendRow(data);

    // List files inside the folder
    var files = childFolder.getFiles();
    while (listAll & files.hasNext()) {
      var childFile = files.next();
      var permissions1 = childFile.getEditors();// Viewers List : getEditors→getViewers
      let arrayList3 = [];
      let arrayList4 = [];
      for (var i = 0; i < permissions1.length; i++) {
        //Email address
        //Detomo
        if (permissions[i].getEmail().includes("detomo.co.jp")) {
          arrayList3.push(permissions[i].getEmail().split("@")[0]);
        } else {
          //Other
          arrayList4.push(permissions[i].getEmail().split("@")[0]);
        }
      }
      data = [
        parentName + "/" + childFolder.getName() + "/" + childFile.getName(),
        childFile.getName(),
        //childFile.getUrl(),
        //childFile.getLastUpdated(),
        arrayList3.toString(),
        arrayList4.toString()
      ];
      // Write
      sheet.appendRow(data);
    }

    // Recursive call of the subfolder
    getChildFolders(parentName + "/" + childFolder.getName(), childFolder, data, sheet, listAll);
  }
}



