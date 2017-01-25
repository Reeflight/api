'use strict';
import bluetooth from 'node-bluetooth';
import {networkInterfaces} from 'os';
import EventEmitter from 'events';
export default class Interfaces extends EventEmitter {
  constructor() {
    super();
  }
  set hasWlan(value) {
    this._hasWlan = value;
  }
  set hasLan(value) {
    this._hasLan = value;
  }
  set hasBluetooth(value) {
    this._hasBluetooth = value;
  }
  set bleDevices(value) {
    this._bleDevices = value;
  }
  set interfaces(value) {
    this._interfaces = value;
  }
  get hasWlan() {
    return this._hasWlan || false;
  }
  get hasLan() {
    return this._hasLan || false;
  }
  get hasBluetooth() {
    return this._hasBluetooth || false;
  }
  get bleDevices() {
    return this._bleDevices || [];
  }
  get interfaces() {
    return this._interfaces || {lan: [], wlan: [], bluetooth: []};
  }
  getInterfaces() {
    const interfaces = networkInterfaces();
    const device = new bluetooth.DeviceINQ();

    for (let _interface of Object.keys(interfaces)) {
      if (_interface.includes('wlan')) {
        this.updateInterfaces('wlan', interfaces[_interface]);
        this.hasWlan = true;
      }
      if (_interface.includes('Ethernet')) {
        this.updateInterfaces('lan', interfaces[_interface]);
        this.hasLan = true;
      }
    }
    device.listPairedDevices(devices => {
      if (devices.length > 0) {
        this.interfaces.bluetooth = devices;
      }
    });
    device
      .on('finished',  () => {
        if (this.interfaces.bluetooth.length > 0) {
          this.hasBluetooth = true;
        }
        this.emit('finished', {
          hasWlan: this.hasWlan,
          hasLan: this.hasLan,
          hasBluetooth: this.hasBluetooth
        });
      })
      .on('found', (address, name) => {
        this.updateInterfaces('bluetooth', {address: address, name: name});
      }).inquire();
  }

  updateInterfaces(target, _interface) {
    let interfaces = this.interfaces;
    interfaces[target].push(_interface);
    this.notify('interfaces', interfaces);
  }
  /**
   * Notify property, write the whole prop to make the getter run.
   */
  notify(name, data) {
    this[name] = data;
  }
}
