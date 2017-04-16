import {readFile, writeFile} from 'fs';

class Fs {
  /**
   *  read file from src
   *
   * @param {string} src  file directory
   * @return {string} resolves content of file
   **/
  read(src) {
    return new Promise((resolve, reject) => {
      try {
        readFile(src, 'utf-8', (error, data) => {
          if (error) reject(error);
          else resolve(data);
        });
      } catch(error) {
        reject(error);
      }
    });
  }
  readJSON(src) {
    return new Promise((resolve, reject) => {
      try {
        this.read(src).then(content => {
          resolve(JSON.parse(content));
        });
      } catch(error) {
        reject(error);
      }
    });
  }
  /**
   *  write file to directory
   *
   * @param {string} dest file directory
   * @return promise
   **/
  write(dest, content) {
    return new Promise((resolve, reject) => {
      try {
        writeFile(dest, content, (error) => {
          if (error) reject(error);
          else resolve();
        });
      } catch(error) {
        reject(error);
      }
    });
  }
}

export default new Fs();