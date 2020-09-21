import sqlite from 'sqlite'
import sqlite3 from 'sqlite3'
import URLSafeBase64 from 'urlsafe-base64'
import crypto from 'crypto'

export default async function createStore() {
  const db = await sqlite.open({
    filename: './store/data/db.sqlite',
    driver: sqlite3.Database
  })

  await db.migrate({ migrationsPath: './store/migrations' })

  async function saveSubscription(userId: string, subscription: object) {
    const textSubscription = JSON.stringify(subscription);

    await db.run('DELETE FROM subscriptions WHERE user_id = ?', userId)
    await db.run('INSERT INTO subscriptions VALUES (?, ?, ?)', userId, textSubscription, 1)
  }

  async function disableSubscription(userId: string) {
    return db.run('UPDATE subscriptions SET enabled = ? WHERE user_id = ?', 0, userId)
  }

  async function createChannel(userId, label) {
    return generateChannel()
      .then(channel => {
        return db.run('INSERT INTO channels VALUES (?, ?, ?)', channel, userId, label)
          .then(() => channel);
      });
  }

  async function getChannelLabel(channel) {
    return db.get('SELECT label FROM channels WHERE id = ?', channel)
      .then(r => r && r.label);
  }

  async function setChannelLabel(userId, channel, label) {
    return db.run('UPDATE channels SET label = ? WHERE id = ? AND user_id = ?', label, channel, userId);
  }

  async function destroyChannel(userId, channel) {
    return db.run('DELETE FROM channels WHERE id = ? AND user_id = ?', channel, userId);
  }

  async function getSubscriptionByChannel(channel) {
    return getUserByChannel(channel)
      .then(userId => db.get('SELECT subscription, enabled FROM subscriptions WHERE user_id = ?', userId))
      .then(r => {
        if(r && r.enabled) {
          return JSON.parse(r.subscription);
        }
        return null;
      });
  }

  async function getUserByChannel(channel) {
    return db.get('SELECT user_id FROM channels WHERE id = ?', channel)
      .then(r => r.user_id);
  }

  async function getUserChannels(userId) {
    return db.all('SELECT id, label FROM channels WHERE user_id = ?', userId);
  }

  async function validateSubscription(obj) {
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

  async function generateChannel() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(12, (err, bytes) => {
        if(err) reject(err);
        else resolve(URLSafeBase64.encode(bytes));
      });
    });
  }

  return {
    saveSubscription,
    disableSubscription,
    validateSubscription,
    createChannel,
    destroyChannel,
    getChannelLabel,
    setChannelLabel,
    getUserChannels,
    getSubscriptionByChannel
  }
}
