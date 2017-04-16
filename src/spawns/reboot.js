'use strict';
import {spawn} from 'child_process';

  /* gets and writes SSID's
   */
export default () => {
  return new Promise((resolve, reject) => {
    try {
      const reboot = spawn('sudo', ['reboot']);
      reboot.stderr.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};