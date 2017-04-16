'use strict';
import {writeFile} from 'fs';
import {spawn} from 'child_process';
import path from 'path';
  /* gets and writes SSID's
   */
export default () => {
  return new Promise((resolve, reject) => {
    try {
      const iwlist = spawn('sudo', ['iwlist', 'wlan0', 'scan']);
      let ssids = [];
      
      iwlist.stdout.on('data', data => {
        data = data.toString();
        const matches = data.match(/ESSID(.*)/g);
        if (matches) {
          for(let match of matches) {
            if (match) {
              match = match.slice(6);
            ssids.push(match);
            }
          }
          writeFile(path.join(__dirname, 'ssids.json'), JSON.stringify(ssids), error => {
            if (error) reject(error) ;
            else resolve();
          });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};