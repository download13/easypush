const {h, render} = require('preact');
const uuid = require('uuid').v4
const Notifications = require('./components/notifications');


if(navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js');
}

render(
  <Notifications/>,
  document.getElementById('appmount')
);
