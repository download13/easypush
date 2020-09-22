import express from 'express'
import expressJWT from 'express-jwt'
import webpush from 'web-push'
import createStore from './store.js'
import {
	vapidPublicKey,
	vapidPrivateKey,
	jwtSecret
} from './config.js'
import addRoutes from './routes/index.js'

webpush.setVapidDetails(
	'mailto:erin@erindachtler.me',
	vapidPublicKey,
	vapidPrivateKey
)

async function main() {
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

main()