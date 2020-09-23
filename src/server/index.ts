import express from 'express'
import webpush from 'web-push'
import createStore from './store.js'
import addRoutes from './routes/index.js'

import 'dotenv/config.js'
const { VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY} = process.env
if(!VAPID_CONTACT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
	throw 'Make a .env file! See README.md for details'
}

webpush.setVapidDetails(
	VAPID_CONTACT,
	VAPID_PUBLIC_KEY,
	VAPID_PRIVATE_KEY
)

async function main() {
	const app = express()

	const store = await createStore()

	app.use(express.static('src/server/static', { extensions: ['html'] }))
	app.use(express.static('dist/client'))

	addRoutes(app, store)

	app.listen(80, () => console.log('Listening on 80'))
}

main()
