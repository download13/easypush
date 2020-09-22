import type { Store } from '../store.js'
import type { Express } from 'express'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import webpush from 'web-push'
import { isSubscription, usersOnly } from './common.js'
import { jwtSecret } from '../config.js'

const jsonBody = bodyParser.json()
const textBody = bodyParser.text()
const urlBody = bodyParser.urlencoded({extended: false})

export default function addRoutes(app: Express, store: Store) {
	app.post('/enable', jsonBody, async (req, res) => {
		const { key } = req.query
    const subscription = req.body

    if(isSubscription(subscription)) {
      await store.saveSubscription(req.user.data, subscription)
      res.send(token)
    } else {
      res.status(400).send('Invalid subscription')
    }
  })

  app.post('/disable', usersOnly, async (req, res) => {
    await store.disableSubscription(req.user.data)
    res.send('Disabled')
  })

  app.post('/channel/create', usersOnly, textBody, (req, res) => {
    const channel = await store.createChannel(req.user.data, req.body)
    res.send(channel)
  })

  app.post('/channel/:channel/label', usersOnly, textBody, async (req, res) => {
    const label = req.body

    await store.setChannelLabel(req.user.data, req.params.channel, label)
    res.send(label)
  })

  app.post('/channel/destroy', usersOnly, textBody, async (req, res) => {
    await store.destroyChannel(req.user.data, req.body)
    res.send('Destroyed')
  })

  app.get('/channel/list', usersOnly, async (req, res) => {
    const channels = await store.getUserChannels(req.user.data)
    res.send(channels)
  })

  app.post('/notify/:channel', urlBody, async (req, res) => {
    const title = await store.getChannelLabel(req.params.channel)

    if(!title) {
      res.status(404).send('Invalid channel')
      return
    }

    const {text, icon} = req.body
    const payload = JSON.stringify({title, text, icon})

    const subscription = await store.getSubscriptionByChannel(req.params.channel)
    if(!subscription) {
      res.status(404).send('Invalid channel')
      return
    }

    try {
      await webpush.sendNotification(subscription, payload)
      res.send('Notified')
    } catch(err) {
      console.error(err.stack)
      res.status(400).send('Unable to send notification')
    }
  })
}