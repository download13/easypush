import { vapidPublicKey } from './config'

const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

async function createChannel(label) {
	const res = await authedFetch('/channel/create', {
		method: 'POST',
		headers: {'Content-Type': 'text/plain'},
		body: label || ''
	})

	if(res.ok) {
		return res.text()
	} else {
		console.error('createChannel error', res.status, await res.text())
		return null
	}
}

async function setChannelLabel(channel, label) {
	const res = await authedFetch(`/channel/${channel}/label`, {
		method: 'POST',
		headers: {'Content-Type': 'text/plain'},
		body: label
	})

	if(res.ok) {
		return res.text()
	} else {
		console.error('setChannelLabel error', res.status, await res.text())
		return null
	}
}

async function destroyChannel(channel) {
	const res = await authedFetch('/channel/destroy', {
		method: 'POST',
		headers: {'Content-Type': 'text/plain'},
		body: channel
	})

	if(res.ok) {
		return res.text()
	} else {
		console.error('destroyChannel error', res.status, await res.text())
		return null
	}
}

async function getChannels() {
	const res = await authedFetch('/channel/list')

	if(res.ok) {
		return res.json()
	} else if(res.status === 401) {
		console.log('getChannels: No channels. Not logged in.')
		return []
	} else {
		console.error('createChannel error', res.status, await res.text())
		return []
	}
}

async function enableNotifications() {
	const status = await Notification.requestPermission()
	if(status !== 'granted') return false

	const registration = await navigator.serviceWorker.getRegistration()

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

async function disableNotifications() {
	const res = await authedFetch('/disable', {method: 'POST'})

	const text = await res.text()

	if(res.ok) {
		return true
	} else {
		console.error('disableNotifications error', res.status, text)
		return false
	}
}

function authedFetch(url, options = {}) {
	let key = localStorage.getItem('easypushKey')
	if(!key) {
		key = uuid()
		localStorage.setItem('easypushKey', key)
	}

	if(!options.headers) options.headers = {}
	options.headers.Authorization = key

	return fetch(url, options)
}


exports.enableNotifications = enableNotifications
exports.disableNotifications = disableNotifications
exports.createChannel = createChannel
exports.destroyChannel = destroyChannel
exports.getChannels = getChannels
exports.setChannelLabel = setChannelLabel
exports.testNotifyChannel = () => {
	const channel = document.getElementById('channel')
	fetch('/notify/' + channel.value, {
		method: 'POST',
		body: 'title=testtitle&text=testtext',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	})
		.then(res => res.text())
		.then(t => console.log(t))
}


function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - base64String.length % 4) % 4)
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/')

	const rawData = window.atob(base64)
	const outputArray = new Uint8Array(rawData.length)

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i)
	}
	return outputArray
}
