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
      // Read states
      let states = await _states.read();
      
      // Do a ping
      const pingResolve = await ping();
      // Ping is true
      // if (pingResolve === 0) {
      //   // Write to Rapi JSON
      //   states.comfirmedWifi = true;
      //   _states.write(states);
      // }
      
      // Check if init AP required
      if (states.isAP && pingResolve === 1) {
        const apState = await ap.init();
      }
      
      // check to set isAP to false
      if (states.isAP && pingResolve === 0) {
        states.isAP = false;
        _states.write(states);
        
        // Restore RPI AP to RPI WIFI
        ap.restore();
        
      }
      // Check if still on ap mode
      if (states.isAP) {
        
        
        // get ssids
        const json = readFileSync(path.join(__dirname, 'ssids.json'));
        
        // serve files in browser
        self.api.use('/api', express.static(__dirname));
        
        // handle api setup request
        self.api.post('/api/setup', (req, res) => {
          async function gen() {
            // Write ap and password to wpa_supplicant.conf
            configWifi(req.query.ap, req.query.password);
            
            // Set isAP to false
            states.isAP = false;
            _states.write(states);
            
            // Send Acknowledge to GUI
            res.send('ok');
            // Reboot
            reboot();
            
          }
          // run async generator
          gen();
        });
      }
      
     await wifi();
     
      
      self.api = express();
      self.server = http.createServer(self.api);
      // setup body parser
      self.api.use(bodyParser.urlencoded({ extended: true }));
      self.api.use(bodyParser.json());
      // setup static routes
      self.api.use('/', express.static(__dirname));
      
      // setup server
      self.api.listen(5000, () => {
        console.log('server started');
      });
      // TODO: create module for ssids(promise)
      
    }
    gen(this);
  }
}

export default new ReeflightApi();