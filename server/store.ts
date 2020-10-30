import type { PushSubscription } from 'web-push'
import prismaStuff from '@prisma/client'
import URLSafeBase64 from 'urlsafe-base64'
import crypto from 'crypto'

const { PrismaClient } = prismaStuff

type ThenArg<T> = T extends PromiseLike<infer U> ? U : T

export type Store = ThenArg<ReturnType<typeof createStore>>

export default async function createStore() {
	const prisma = new PrismaClient()

	async function addSubscription(key: string, subscription: PushSubscription) {
		const subscriptionString = JSON.stringify(subscription)

		await prisma.browserHandle.upsert({
			where: { id: key },
			update: { subscription: subscriptionString },
			create: { id: key, subscription: subscriptionString }
		})
	}

	async function isSubscriptionEnabled(key: string): Promise<boolean> {
		const handle = await prisma.browserHandle.findOne({
			where: { id: key }
		})

		return Boolean(handle && handle.subscription)
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
		const changed = await prisma.channel.updateMany({
			where: {
				id,
				handleId: subscriptionKey
			},
			data: { label }
		})

		return changed.count > 0
	}

	async function removeChannel(subscriptionKey: string, id: string) {
		const removed = await prisma.channel.deleteMany({
			where: {
				id,
				handleId: subscriptionKey
			}
		})

		return removed.count > 0
	}

	async function getUserChannels(subscriptionKey: string) {
		return await prisma.channel.findMany({
			where: { handleId: subscriptionKey }
		})
	}

	async function getNotificationInfo(channelId: string) {
		const channel = await prisma.channel.findOne({
			where: { id: channelId },
			include: { handle: true }
		})

		if(channel && channel.handle.subscription) {
			return {
				title: channel.label,
				subscription: JSON.parse(channel.handle.subscription) as PushSubscription
			}
		}
	}

	return {
		addSubscription,
		isSubscriptionEnabled,
		removeSubscription,
		addChannel,
		setChannelLabel,
		removeChannel,
		getUserChannels,
		getNotificationInfo
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