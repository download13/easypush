import { PrismaClient } from '@prisma/client'
import URLSafeBase64 from 'urlsafe-base64'
import crypto from 'crypto'

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

export type Store = ThenArg<ReturnType<typeof createStore>>

export default async function createStore() {
	const prisma = new PrismaClient()

	async function addSubscription(key: string, subscription: PushSubscriptionJSON) {
		const subscriptionString = JSON.stringify(subscription)

		await prisma.browserHandle.upsert({
			where: { id: key },
			update: { subscription: subscriptionString },
			create: { id: key, subscription: subscriptionString }
		})
	}

	async function removeSubscription(key: string) {
		await prisma.browserHandle.update({
			where: { id: key },
			data: { subscription: '' }
		})
	}

	async function addChannel(subscriptionKey: string, label: string) {
		const id = await generateChannel()

		await prisma.channel.create({ data: {
			id,
			handle: { connect: { id: subscriptionKey } },
			label
		}})

		return id
	}

	async function setChannelLabel(subscriptionKey: string, id: string, label: string) {
		const channel = await prisma.channel.findOne({
			where: { id }
		})

		if(!channel || channel.handleId !== subscriptionKey) return false

		await prisma.channel.update({
			where: { id },
			data: { label }
		})
		return true
	}

	async function removeChannel(subscriptionKey: string, id: string) {
		const channel = await prisma.channel.findOne({
			where: { id }
		})

		channel.handle()

		if(!channel || channel.handleId !== subscriptionKey) return false

		await prisma.channel.delete({ where: { id } })
		return true
	}

	/*
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

	async function getUserByChannel(channel: string) {
		return db.get('SELECT user_id FROM channels WHERE id = ?', channel)
			.then(r => r.user_id)
	}

	async function getUserChannels(userId: string) {
		return db.all('SELECT id, label FROM channels WHERE user_id = ?', userId)
	}
	*/

	return {
		addSubscription,
		removeSubscription,
		addChannel,
		setChannelLabel,
		removeChannel,
		/*
		getUserChannels,
		getSubscriptionByChannel */
	}
}

function generateChannel(): Promise<string> {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(12, (err, bytes) => {
			if(err) reject(err)
			else resolve(URLSafeBase64.encode(bytes))
		})
	})
}