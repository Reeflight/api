'use strict';
import {spawn} from 'child_process';

export default () => {
  return new Promise((resolve, reject) => {
    try {
        const ping = spawn('ping', ['google.be', '-c', '3'] );
    ping.stderr.on('data', data => {
      console.log(data.toString());
    });
    ping.on('close', (code) => {
      resolve(code);
    });
    } catch(error) {
      reject(error);
    }
  });

};