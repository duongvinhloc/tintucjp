const downloadCSV = require('./getCSV');
const { copyAndchangeFile, checkFileExist, deleteFile } = require('./fileExec');
async function executeFunctions() {
    await downloadCSV();
    await copyAndchangeFile();
}
executeFunctions();

