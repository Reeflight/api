'use strict';

export default Backed(class RlApi extends HTMLElement {
  static get properties() {
    return {
      wifi: {
        observer: 'change'
      },
      password: {
        observer: 'change'
      }
    };
  }
  get select() {
    return this.querySelector('select');
  }
  get input() {
    return this.querySelector('input');
  }
  get send() {
    return this.querySelector('.send');
  }
  connected() {
    this.onValue = this.onValue.bind(this);
    this.onclick = this.onClick.bind(this);
    
    this.select.addEventListener('change', this.onValue);
    this.input.addEventListener('input', this.onValue);
    this.send.addEventListener('click', this.onClick);
    
    
    this.xhttp('GET', '/api/ssids.json', event => {
      const target = event.target;
      if (target.readyState === 4 && target.status === 200) {
        const response = JSON.parse(target.response);
        
        for (let item of response) {
          let option = document.createElement('option');
          item = item.replace(/"/g, '');
          option.value = item;
          option.innerHTML = item;
          this.select.appendChild(option);
          if (response.indexOf(`"${item}"`) === 0)
            this.select.dispatchEvent(new CustomEvent('change'));
        }
      }
    });
  }
  
  onValue(event) {
    if(event.target.name === "wifi-pass") {
      this.password = event.target.value;
    }
    if(event.target.name === "ap") {
      this.wifi = event.target.value;
    }
  }
  
  onClick(event) {
    if(this.wifi && this.password) {
      this.xhttp('POST', `/api/setup?ap=${this.wifi}&password=${this.password}`, event => {
        // TODO: Handle errors
      });
    }
  }

  change(change) {
    if (this.wifi && this.password){
     this.send.classList.remove('disabled');
    } else if(!this.password || !this.wifi) {
      this.send.classList.add('disabled');
    }
  }
  
  xhttp(mode, url, cb) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = (event) => {
      cb(event);
    };
    
    xhttp.open(mode, url);
    xhttp.send();
  }
});