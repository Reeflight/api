'use strict';
import {readFile, writeFile} from 'fs';
import path from 'path';

export default (ap, password) => {
  
  return new Promise((resolve, reject) => {
    
    try {
      readFile('/etc/wpa_supplicant/wpa_supplicant.conf', (error, data)  => {
        if (error) return reject(error);
        let content = data.toString() || '';
        if (content.includes(`"${ap}"`)) {
          const regEx = new RegExp(`ssid="${ap}"\n(.*)psk=(.*)`, 'g');
          content= content.replace(regEx, `ssid="${ap}"
            psk="${password}"`);
          
        } else {
          content += `network={
            ssid="${ap}"
            psk="${password}"
            key_mgmt=WPA-PSK
          }`;
        }
        writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', content, (error) => {
          if (error) return reject(error);
          resolve();
        });
      });
    } catch (error) {
      reject(error);
    }
  });
  
  
};