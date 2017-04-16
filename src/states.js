import fs from './fs.js';
import path from 'path';

class States {
  constructor() {
    this.src = path.resolve('../../reeflight/org.reeflight.rapi.json');
  }
  read() {
    return fs.readJSON(this.src);
  }
  write(content) {
    return fs.write(this.src, JSON.stringify(content));
  }
}

export default new States();