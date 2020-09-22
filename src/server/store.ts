import { PrismaClient } from '@prisma/client'
import URLSafeBase64 from 'urlsafe-base64'
import crypto from 'crypto'

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

export type Store = ThenArg<ReturnType<typeof createStore>>

export default async function createStore() {
  const prisma = new PrismaClient()

  async function saveSubscription(key: string, subscription: any) {
    const textSubscription = JSON.stringify(subscription)

    prisma.browserHandle.upsert({
      where: { sub },
      create: { subscription }
    })

    await prisma.run('DELETE FROM subscriptions WHERE user_id = ?', userId)
    await db.run('INSERT INTO subscriptions VALUES (?, ?, ?)', userId, textSubscription, 1)
  }

  async function disableSubscription(userId: string) {
    return db.run('UPDATE subscriptions SET enabled = ? WHERE user_id = ?', 0, userId)
  }

  async function createChannel(userId, label) {
    return generateChannel()
      .then(channel => {
        return db.run('INSERT INTO channels VALUES (?, ?, ?)', channel, userId, label)
          .then(() => channel)
      })
  }

  async function getChannelLabel(channel) {
    return db.get('SELECT label FROM channels WHERE id = ?', channel)
      .then(r => r && r.label)
  }

  async function setChannelLabel(userId, channel, label) {
    return db.run('UPDATE channels SET label = ? WHERE id = ? AND user_id = ?', label, channel, userId)
  }

  async function destroyChannel(userId, channel) {
    return db.run('DELETE FROM channels WHERE id = ? AND user_id = ?', channel, userId)
  }

  async function getSubscriptionByChannel(channel) {
    return getUserByChannel(channel)
      .then(userId => db.get('SELECT subscription, enabled FROM subscriptions WHERE user_id = ?', userId))
      .then(r => {
        if(r && r.enabled) {
          return JSON.parse(r.subscription)
        }
        return null
      })
  }

  async function getUserByChannel(channel) {
    return db.get('SELECT user_id FROM channels WHERE id = ?', channel)
      .then(r => r.user_id)
  }

  async function getUserChannels(userId) {
    return db.all('SELECT id, label FROM channels WHERE user_id = ?', userId)
  }

  async function generateChannel() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(12, (err, bytes) => {
        if(err) reject(err)
        else resolve(URLSafeBase64.encode(bytes))
      })
    })
  }

  return {
    saveSubscription,
    disableSubscription,
    createChannel,
    destroyChannel,
    getChannelLabel,
    setChannelLabel,
    getUserChannels,
    getSubscriptionByChannel
  }
}
