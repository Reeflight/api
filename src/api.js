'use strict';
import http from 'http';
import express from 'express';
import {readFileSync} from 'fs';
import path from 'path';
import wifi from './spawns/wifi.js';
import bodyParser from 'body-parser';
import ping from './spawns/ping.js';
import configWifi from './spawns/config-wifi.js';
import ap from 'rpi-ap-setup';
import fs from './fs.js';
import _states from './states.js';
import reboot from './spawns/reboot.js';
class ReeflightApi {
  constructor() {
    
    async function gen(self) {
      self.api = express();
      self.server = http.createServer(self.api);
      // setup body parser
      self.api.use(bodyParser.urlencoded({ extended: true }));
      self.api.use(bodyParser.json());
      // setup static routes
      self.api.use('/', express.static(__dirname));
      
      // Read states
      let states = await _states.read();
      
      // Do a ping
      const pingResolve = await ping();
      // check for internet connection
      // TODO: check if on local network instead
      if (states.isAP) {
        if (pingResolve === 0) {
          // Write to Rapi JSON
          states.comfirmedWifi = true;
          states.isAP = false;
          states.needsConfirm = false;
          _states.write(states);
        } else if (!states.needsConfirm) {
          console.log('ready to init ap');
          const apState = await ap.init();
          states.needsConfirm = true;
          _states.write(states);
          reboot();
        }
        if (!states.confirmedWifi && states.needsConfirm) {
          self.retry(states);
          // routes.api.ap(self)
          
          
          // wait till the ssids are writen
          await wifi();
          // get ssids
          const json = readFileSync(path.join(__dirname, 'ssids.json'));
          
          // serve files in browser
          self.api.use('/api', express.static(__dirname));
          
          self.api.get('/', (req, res) => {
            clearTimeout(self.retry)
          });
          
          // handle api setup request
          self.api.post('/api/setup', (req, res) => {
            async function gen() {
              // Write ap and password to wpa_supplicant.conf
              configWifi(req.query.ap, req.query.password);
              // Send Acknowledge to GUI
              res.send('ok');
              // Reboot
              
              ap.restore();
              
            }
            // run async generator
            gen();
          });
        }
      }
      
      if (!states.confirmedWifi) {
        
      }
      // setup server
      self.api.listen(80, () => {
        console.log('server started');
      });
    }
    gen(this);
  }
  
        
  retry(states) {
    return setTimeout(() => {
      states.comfirmedWifi = false;
      states.isAP = true;
      states.needsConfirm = false;
      _states.write(states);
      ap.restore();
    }, 60000);
    // return retry;
  }
}

export default new ReeflightApi();