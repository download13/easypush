import { v4 as uuid } from 'uuid'

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || ''
const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

type Channel = {
	id: string
	label: string
}

export type NotificationResponse = {
	enabled: boolean
	channels: Channel[]
}
export const disabledNotificationResponse = {
	enabled: false,
	channels: []
}

export async function getNotificationState(): Promise<NotificationResponse> {
	const res = await authedFetch('/channel/list')

	if(res.ok) {
		return {
			enabled: true,
			channels: await res.json()
		}
	} else if(res.status !== 401) {
		console.error('createChannel error', res.status, await res.text())
	}

	return disabledNotificationResponse
}

export async function createChannel(label: string): Promise<boolean> {
	const res = await authedFetch('/channel/create', {
		method: 'POST',
		headers: {'Content-Type': 'text/plain'},
		body: label || ''
	})

	if(res.ok) {
		return true
	} else {
		console.error('createChannel error', res.status, await res.text())
		return false
	}
}

export async function setChannelLabel(channel: string, label: string): Promise<boolean> {
	const res = await authedFetch(`/channel/${channel}/label`, {
		method: 'POST',
		headers: {'Content-Type': 'text/plain'},
		body: label
	})

	if(res.ok) {
		return true
	} else {
		console.error('setChannelLabel error', res.status, await res.text())
		return false
	}
}

export async function destroyChannel(channel: string): Promise<boolean> {
	const res = await authedFetch('/channel/destroy', {
		method: 'POST',
		headers: {'Content-Type': 'text/plain'},
		body: channel
	})

	if(res.ok) {
		return true
	} else {
		console.error('destroyChannel error', res.status, await res.text())
		return false
	}
}

export async function enableNotifications(): Promise<boolean> {
	const status = await Notification.requestPermission()
	if(status !== 'granted') return false

	const registration = await navigator.serviceWorker.getRegistration()
	if(!registration) {
		console.error('Unable to enable notifications. No serviceworker registration')
		return false
	}

	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey
	})

	const res = await authedFetch('/enable', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(subscription)
	})

	if(res.ok) {
		return true
	} else {
		console.error('enableNotifications error', res.status)
		return false
	}
}

export async function disableNotifications(): Promise<boolean> {
	const res = await authedFetch('/disable', {method: 'POST'})

	const text = await res.text()

	if(res.ok) {
		return true
	} else {
		console.error('disableNotifications error', res.status, text)
		return false
	}
}

function authedFetch(url: string, options: RequestInit = {}) {
	let key = localStorage.getItem('easypushKey')
	if(!key) {
		key = uuid()
		localStorage.setItem('easypushKey', key)
	}

	options.headers = {
		...options.headers,
		Authorization: key
	}

	return fetch(url, options)
}


export async function testNotifyChannel(channel: string): Promise<void> {
	const res = await fetch('/notify/' + channel, {
		method: 'POST',
		body: 'title=testtitle&text=testtext',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	})
	console.log(await res.text())
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - base64String.length % 4) % 4)
	const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/')

	const rawData = window.atob(base64)
	const outputArray = new Uint8Array(rawData.length)

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}
