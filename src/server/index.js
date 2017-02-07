const express = require('express');
const bodyParser = require('body-parser');
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');
const {
  dbReady,
  validateSubscription,
  saveSubscription,
  createChannel,
  destroyChannel,
  getSubscriptionByChannel,
  getUserChannels,
  getChannelLabel,
  setChannelLabel,
  disableSubscription
} = require('./store');
const {usersOnly} = require('./common');
const {
  vapidPublicKey,
  vapidPrivateKey,
  jwtSecret
} = require('./config');
const webpush = require('web-push');
const uuid = require('uuid/v4');


webpush.setVapidDetails(
  'mailto:download333@gmail.com',
  vapidPublicKey,
  vapidPrivateKey
);

const jsonBody = bodyParser.json();
const textBody = bodyParser.text();
const urlBody = bodyParser.urlencoded({extended: false});

const app = express();

app.use(express.static('dist/public', {extensions: ['html']}));

app.use(expressJWT({
  secret: jwtSecret,
  credentialsRequired: false
}));

app.post('/enable', jsonBody, (req, res) => {
  if(!req.user) {
    req.user = {data: uuid()};
  }

  const token = jwt.sign({data: req.user.data}, jwtSecret);

  const subscription = validateSubscription(req.body);

  if(subscription) {
    saveSubscription(req.user.data, subscription)
      .then(() => res.send(token));
  } else {
    res.status(400).send('Invalid subscription');
  }
});

app.post('/disable', usersOnly, (req, res) => {
  disableSubscription(req.user.data)
    .then(() => res.send('Disabled'));
});

app.post('/channel/create', usersOnly, textBody, (req, res) => {
  createChannel(req.user.data, req.body)
    .then(channel => res.send(channel));
});

app.post('/channel/:channel/label', usersOnly, textBody, (req, res) => {
  const label = req.body;

  setChannelLabel(req.user.data, req.params.channel, label)
    .then(() => res.send(label));
});

app.post('/channel/destroy', usersOnly, textBody, (req, res) => {
  destroyChannel(req.user.data, req.body)
    .then(() => res.send('Destroyed'));
});

app.get('/channel/list', usersOnly, (req, res) => {
  getUserChannels(req.user.data)
    .then(channels => res.send(channels));
});

app.post('/notify/:channel', urlBody, (req, res) => {
  getChannelLabel(req.params.channel)
    .then(title => {
      const {text, icon} = req.body;
      const payload = JSON.stringify({title, text, icon});

      getSubscriptionByChannel(req.params.channel)
        .then(subscription => {
          if(subscription) {
            webpush.sendNotification(subscription, payload)
              .then(() => res.send('Notified'));
          } else {
            res.status(404).send('Invalid channel');
          }
        });
    });
});

dbReady.then(() => {
  app.listen(80, () => console.log('Listening on 80'));
});
