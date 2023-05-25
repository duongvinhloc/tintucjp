const downloadCSV = require('./getCSV');
const { copyAndchangeFile, checkFileExist, deleteFile } = require('./fileExec');
async function executeFunctions() {
    await deleteFile();
    await downloadCSV();
    await copyAndchangeFile();
}
executeFunctions();

