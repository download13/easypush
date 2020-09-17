const db = require('sqlite');
const sqlite3 = require('sqlite3');
const URLSafeBase64 = require('urlsafe-base64');
const crypto = require('crypto');


function saveSubscription(userId, subscription) {
  const textSubscription = JSON.stringify(subscription);

  return db.run('DELETE FROM subscriptions WHERE user_id = ?', userId)
    .then(() => db.run('INSERT INTO subscriptions VALUES (?, ?, ?)', userId, textSubscription, 1));
}

function disableSubscription(userId) {
  return db.run('UPDATE subscriptions SET enabled = ? WHERE user_id = ?', 0, userId);
}

function createChannel(userId, label) {
  return generateChannel()
    .then(channel => {
      return db.run('INSERT INTO channels VALUES (?, ?, ?)', channel, userId, label)
        .then(() => channel);
    });
}

function getChannelLabel(channel) {
  return db.get('SELECT label FROM channels WHERE id = ?', channel)
    .then(r => r && r.label);
}

function setChannelLabel(userId, channel, label) {
  return db.run('UPDATE channels SET label = ? WHERE id = ? AND user_id = ?', label, channel, userId);
}

function destroyChannel(userId, channel) {
  return db.run('DELETE FROM channels WHERE id = ? AND user_id = ?', channel, userId);
}

function getSubscriptionByChannel(channel) {
  return getUserByChannel(channel)
    .then(userId => db.get('SELECT subscription, enabled FROM subscriptions WHERE user_id = ?', userId))
    .then(r => {
      if(r && r.enabled) {
        return JSON.parse(r.subscription);
      }
      return null;
    });
}

function getUserByChannel(channel) {
  return db.get('SELECT user_id FROM channels WHERE id = ?', channel)
    .then(r => r.user_id);
}

function getUserChannels(userId) {
  return db.all('SELECT id, label FROM channels WHERE user_id = ?', userId);
}

function validateSubscription(obj) {
  if(
    typeof obj.endpoint !== 'string' ||
    typeof obj.keys !== 'object' ||
    typeof obj.keys.auth !== 'string' ||
    typeof obj.keys.p256dh !== 'string'
  ) return null;

  return {
    endpoint: obj.endpoint,
    keys: {
      auth: obj.keys.auth,
      p256dh: obj.keys.p256dh
    }
  };
}

function generateChannel() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(12, (err, bytes) => {
      if(err) reject(err);
      else resolve(URLSafeBase64.encode(bytes));
    });
  });
}


exports.saveSubscription = saveSubscription;
exports.disableSubscription = disableSubscription;
exports.validateSubscription = validateSubscription;
exports.createChannel = createChannel;
exports.destroyChannel = destroyChannel;
exports.getChannelLabel = getChannelLabel;
exports.setChannelLabel = setChannelLabel;
exports.getUserChannels = getUserChannels;
exports.getSubscriptionByChannel = getSubscriptionByChannel;
exports.dbReady = db.open({
  filename: './store/data/db.sqlite',
  driver: sqlite3.Database
}).then(db => {
  db.migrate({ migrationsPath: './store/migrations' })
  return db
});
