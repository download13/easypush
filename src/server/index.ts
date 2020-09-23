import express from 'express'
import expressJWT from 'express-jwt'
import webpush from 'web-push'
import createStore from './store.js'
import addRoutes from './routes/index.js'

import 'dotenv/config.js'
const { JWT_SECRET, VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY} = process.env
if(!JWT_SECRET || !VAPID_CONTACT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
	throw 'Make a .env file! See README.md for details'
}

webpush.setVapidDetails(
	VAPID_CONTACT,
	VAPID_PUBLIC_KEY,
	VAPID_PRIVATE_KEY
)

async function main(jwtSecret: string) {
	const app = express()

	const store = await createStore()

	app.use(express.static('dist/public', {extensions: ['html']}))

	app.use(expressJWT({
		secret: jwtSecret,
		credentialsRequired: false,
		algorithms: ['HS256']
	}))

	addRoutes(app, store)

	app.listen(80, () => console.log('Listening on 80'))
}

main(JWT_SECRET)