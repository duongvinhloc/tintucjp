const fs = require('fs');
require('dotenv').config();
const iconv = require('iconv-lite');
const path = require('path');
const folderPath = './download';
const destinationFolder = './store';
const backupFolder = './backup';

var d = new Date();
const hours = d.getHours();
const minutes = d.getMinutes();
const seconds = d.getSeconds();
var yesterday = new Date(Date.now() - 86400000);
var formattedD = `
${d.getFullYear()}
${(d.getMonth() + 1).toString().padStart(2, '0')}
${d.getDate().toString().padStart(2, '0')}
`.replace(/\n|\r/g, '');
var formattedY = `
${yesterday.getFullYear()}
${(yesterday.getMonth() + 1).toString().padStart(2, '0')}
${yesterday.getDate().toString().padStart(2, '0')}
`.replace(/\n|\r/g, '');
const oldFileName = 'nyusatsu_king_' + d.getFullYear().toString() + '.csv';
const newFileName = 'nyusatsu_king_' + formattedY + '_' + formattedD + '.csv';
const backupFileName = 'nyusatsu_king_' + formattedY + '_' + formattedD + hours + minutes + seconds + '.csv';
const sourceFilePath = path.join(folderPath, oldFileName);
const sourceFileStore = path.join(destinationFolder, newFileName);



const inputEncoding = 'Shift_JIS';
const outputEncoding = 'UTF-8';



async function copyAndchangeFile() {
  const destinationFilePath = path.join(destinationFolder, newFileName);
  fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
    if (err) {
      console.error(err);
    } else {
      const inputData = fs.readFileSync(destinationFilePath);
      const decodedData = iconv.decode(inputData, inputEncoding);
      const encodedData = iconv.encode(decodedData, outputEncoding);
      fs.writeFileSync(destinationFilePath, encodedData);
      console.log('ファイル名変更、移動しました');
    }
  });
}

async function checkFileExist(pathParam) {
  const files = fs.readdirSync(pathParam);
  if (files.length > 0) {
    return true;
  } else {
    console.log('ディレクトリ内にファイルがありません');
    return false;
  }
}

async function deleteFile() {
  if(checkFileExist(destinationFolder)){
    const backupFilePath = path.join(backupFolder, backupFileName);
    fs.copyFile(sourceFileStore, backupFilePath, (err) => {
      if (err) {
        console.error(err);
      } else {
        const inputData = fs.readFileSync(backupFilePath);
        const decodedData = iconv.decode(inputData, inputEncoding);
        const encodedData = iconv.encode(decodedData, outputEncoding);
        fs.writeFileSync(backupFilePath, encodedData);
        console.log('ファイルバックアップしました');
      }
    });
  }
  fs.readdir(destinationFolder, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(destinationFolder, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log('全て削除しました:', filePath);
      });
    });
  });
}

module.exports = {
  copyAndchangeFile,
  checkFileExist,
  deleteFile
};

