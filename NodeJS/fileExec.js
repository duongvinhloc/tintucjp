const fs = require('fs');
require('dotenv').config();
const iconv = require('iconv-lite');
const path = require('path');
const folderPath = './download';
const destinationFolder = process.env.DestinationFolder;

const oldFileName = 'nyusatsu_king_2023.csv';
var d = new Date();
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
const newFileName = 'nyusatsu_king_' + formattedY + '_' + formattedD + '.csv';
const sourceFilePath = path.join(folderPath, oldFileName);
const destinationFilePath = path.join(destinationFolder, newFileName);

const inputEncoding = 'Shift_JIS';
const outputEncoding = 'UTF-8';



async function copyAndchangeFile() {
  fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('ファイル名変更、移動しました');
      const inputData = fs.readFileSync(destinationFilePath);
      const decodedData = iconv.decode(inputData, inputEncoding);
      const encodedData = iconv.encode(decodedData, outputEncoding);
      fs.writeFileSync(destinationFilePath, encodedData);
    }
  });
}

async function checkFileExist() {
  const files = fs.readdirSync(folderPath);
  if (files.length > 0) {
    return true;
  } else {
    console.log('ディレクトリ内にファイルがありません');
    return false;
  }
}

async function deleteFile() {
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

