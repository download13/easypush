import {
	on,
	cacheAll,
	createRouter,
	networkFirst
} from 'swkit'

const router = createRouter()

const precacheNetworkFirst = networkFirst('precache')

const precachePaths = [
	'/',
	'/docs.css',
	'/notifications',
	'/notifications.css',
	'/client.js'
]

precachePaths.forEach(path => {
	router.get(path, precacheNetworkFirst)
})

on('fetch', router.dispatch)

on('install', e => {
	e.waitUntil(
		cacheAll('precache', precachePaths)
			.then(skipWaiting())
	)
})

on('activate', e => {
	e.waitUntil(clients.claim())
})

on('push', e => {
	try {
		const payload = e.data.json()
		e.waitUntil(
			registration.showNotification(payload.title, {icon: payload.icon, body: payload.text})
		)
	} catch(err) {
		console.log('Got notification without JSON: ', e.data.text())
	}
})
