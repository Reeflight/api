'use strict';
import {readFile, writeFile} from 'fs';
import path from 'path';

export default (ap, password) => {
  
  readFile('/etc/wpa_supplicant/wpa_supplicant.conf', (error, data)  => {
    try {
      
      let content = data.toString();
      if (content.includes(`"${ap}"`)) {
        const regEx = new RegExp(`ssid="${ap}"\n(.*)psk=(.*)`, 'g');
        content= content.replace(regEx, `ssid="${ap}"
          psk="${password}"`);
        
      } else {
        content += `network={
          ssid="${ap}"
          psk="${password}"
          key_mgmt=WPA-PSK
        }`
      }
      writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', content, (error) => {
        
        console.log('Your error:',error);
      });
      
    } catch (error) {
      console.log(error);
    }
  });
  
  
};