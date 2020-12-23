// keepAlive.js
const fetch = require('node-fetch');

// globals
const interval = 25*60*1000; // interval in milliseconds - {25mins x 60s x 1000}ms
const url = 'https://freelancer-job.herokuapp.com/keepalive';

(function wake() {

  try {

    const handler = setInterval(() => {

      fetch(url)
        .then(res => console.log(`response-ok: ${res.ok}, status: ${res.status}`)
        .catch(err => console.error(`Error occured: ${err}`)));

    }, interval);

  } catch(err) {
      console.error('Error occured: retrying...');
      clearInterval(handler);
      return setTimeout(() => wake(), 10000);
  };

})();
