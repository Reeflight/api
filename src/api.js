'use strict';
import http2 from 'http2';
import express from 'express';
import Wifi from './wifi';
import {readFileSync} from 'fs';
import Interfaces from './interfaces';

export default class ReeflightApi {
  constructor() {
    const options = {
      key: readFileSync('certs/ca/my-root-ca.key.pem'),
      cert: readFileSync('certs/ca/my-root-ca.crt.pem')
    }
    this.api = express();
    this.server = http2.createServer(options, this.api);
    this.interfaces = new Interfaces();

    this.interfaces.on('finished', interfaces => {
      if (interfaces.hasWlan) {
        this.wifi = new Wifi();

        this.wifi.on('appear', connection => {
          console.log(connection);
        })
        this.wifi.scan();
      }
      if (interfaces.hasLan) {
        console.log('Lan available');
      }
      if (interfaces.hasBluetooth) {
        console.log('Bluetooth available');
      }
    });

    this.interfaces.getInterfaces();
    this.setupAPIRoutes();
    this.api.listen(5000);
  }

  setupAPIRoutes() {
    this.api.get('/', (req, res) => {
      // TODO: Add documentation how to use for developers
      res.send(this.beautyfy({
        bluetooth: this.interfaces.hasBluetooth,
        Wlan: this.interfaces.hasWlan,
        lan: this.interfaces.hasLan,
        interfaces: this.interfaces.interfaces
      }));
    });

    this.api.get('/devices', (req, res) => {
      if (req.auth === undefined) {
        var message = '';
        let num = Math.random() * (15 - 1) + 1;
        if (num > 5) {
          message = `Sorry, I don't talk to strangers...`;
        } else if (num > 10) {
          message = 'Please identify yourself...';
        } else if (num > 15 || num === 15) {
          mesage = `Hmm, I don't seem to know you...`;
        }
        this.log('Not authorized::' + message);
        return res.send(message);
      } else {
        res.send(this.beautyfy(this.interfaces.interfaces));
        // this.interfaces.getInterfaces();
      }
    });
  }

  beautyfy(obj) {
    return JSON.stringify(obj, null, '\t')
  }

  log(text=String) {
    console.log(text);
  }
}
