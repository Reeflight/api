'use strict';
import EventEmitter from 'events';
import Wireless from 'wireless';
export default class Wifi extends EventEmitter {
  /**
   * @param {number} updateFrequency Optional, seconds to scan for networks
   * @param {number} spyFrequency Optional, seconds to scan if connected
   * @param {number} threshold Optional, how many scans before network considered gone
   */
  constructor(opts={
    iface: 'wlan0', updateFrequency: 10, spyFrequency: 2, threshold: 2
  }) {
    super();
    this.wireless = new Wireless({
      iface: opts.iface,
      updateFrequency: opts.updateFrequency,
      connectionSpyFrequency: opts.spyFrequency,
      vanishThreshold: opts.threshold
    });

    this.wireless.enable(error => {
      // console.log(error);
    });

    this.wireless.on('appear', ap => {
      this.emit('appear', ap)
      console.log(ap);
    });
  }
  scan() {
    this.wireless.start();
  }
}
