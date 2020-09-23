import type { Store } from '../store.js'
import type { Express } from 'express'
import bodyParser from 'body-parser'
import webpush from 'web-push'
import { isSubscription, getChannelId, keyRequired } from './common.js'

const jsonBody = bodyParser.json()
const textBody = bodyParser.text()
const urlBody = bodyParser.urlencoded({extended: false})

export default function addRoutes(app: Express, store: Store) {
	app.post('/enable', jsonBody, keyRequired, async (req, res) => {
		const key = (req as any)['authKey'] as string

		const subscription = req.body
		if(!isSubscription(subscription)) {
			res.status(400).send('Invalid subscription')
			return
		}

		await store.addSubscription(key, subscription)
		res.send('Enabled')
	})

	app.post('/disable', keyRequired, async (req, res) => {
		const key = (req as any)['authKey'] as string

		await store.removeSubscription(key)
		res.send('Disabled')
	})

	app.post('/channel/create', textBody, keyRequired, async (req, res) => {
		const key = (req as any)['authKey'] as string

		const label = req.body
		if(!label || typeof label !== 'string') {
			res.status(400).send('Invalid label')
			return
		}

		const channelId = await store.addChannel(key, label)
		res.send(channelId)
	})

	app.post('/channel/:channel/label', textBody, keyRequired, async (req, res) => {
		const key = (req as any)['authKey'] as string

		const channelId = getChannelId(req.params.channel)
		if(!channelId) {
			res.status(400).send('Invalid channel')
			return
		}

		const label = req.body
		if(!label || typeof label !== 'string') {
			res.status(400).send('Invalid label')
			return
		}

		await store.setChannelLabel(key, channelId, label)
		res.send(label)
	})

	app.post('/channel/destroy', textBody, keyRequired, async (req, res) => {
		const key = (req as any)['authKey'] as string

		const channelId = getChannelId(req.body)
		if(!channelId) {
			res.status(400).send('Invalid channel')
			return
		}

		await store.removeChannel(key, channelId)
		res.send('Destroyed')
	})

	app.get('/channel/list', keyRequired, async (req, res) => {
		const key = (req as any)['authKey'] as string

		const channels = await store.getUserChannels(key)
		res.send(channels)
	})

	app.post('/notify/:channel', urlBody, async (req, res) => {
		const channelId = getChannelId(req.params.channel)
		if(!channelId) {
			res.status(400).send('Invalid channel')
			return
		}

		const info = await store.getNotificationInfo(channelId)
		if(!info) {
			res.status(400).send('Invalid channel or subscriber not available')
			return
		}

		const { title, subscription } = info
		const { text, icon } = req.body

		const payload = JSON.stringify({ title, text, icon })
		subscription.endpoint

		try {
			await webpush.sendNotification(subscription, payload)
			res.send('Notified')
		} catch(err) {
			console.error(err.stack)
			res.status(400).send('Unable to send notification')
		}
	})
}