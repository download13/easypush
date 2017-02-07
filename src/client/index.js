const {h, render} = require('preact');
const Notifications = require('./components/notifications');


if(navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js');
}

render(
  <Notifications/>,
  document.getElementById('appmount')
);
