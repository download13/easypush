import express from 'express'
import bodyParser from 'body-parser'
import expressJWT from 'express-jwt'
import jwt from 'jsonwebtoken'
import webpush from 'web-push'
import { v4 as uuid } from 'uuid'
import createStore from './store.js'
import { usersOnly } from './common.js'
import {
  vapidPublicKey,
  vapidPrivateKey,
  jwtSecret
} from './config.js'

webpush.setVapidDetails(
  'mailto:erin@erindachtler.me',
  vapidPublicKey,
  vapidPrivateKey
)

const jsonBody = bodyParser.json()
const textBody = bodyParser.text()
const urlBody = bodyParser.urlencoded({extended: false})

async function main() {
  const app = express()

  const store = await createStore()

  app.use(express.static('dist/public', {extensions: ['html']}))

  app.use(expressJWT({
    secret: jwtSecret,
    credentialsRequired: false
  }))

  app.post('/enable', jsonBody, async (req, res) => {
    if(!req.user) {
      req.user = {data: uuid()}
    }

    const token = jwt.sign({data: req.user.data}, jwtSecret)

    const subscription = validateSubscription(req.body)

    if(subscription) {
      saveSubscription(req.user.data, subscription)
        .then(() => res.send(token))
    } else {
      res.status(400).send('Invalid subscription')
    }
  })

  app.post('/disable', usersOnly, async (req, res) => {
    disableSubscription(req.user.data)
      .then(() => res.send('Disabled'))
  })

  app.post('/channel/create', usersOnly, textBody, (req, res) => {
    createChannel(req.user.data, req.body)
      .then(channel => res.send(channel))
  })

  app.post('/channel/:channel/label', usersOnly, textBody, (req, res) => {
    const label = req.body

    setChannelLabel(req.user.data, req.params.channel, label)
      .then(() => res.send(label))
  })

  app.post('/channel/destroy', usersOnly, textBody, (req, res) => {
    destroyChannel(req.user.data, req.body)
      .then(() => res.send('Destroyed'))
  })

  app.get('/channel/list', usersOnly, (req, res) => {
    getUserChannels(req.user.data)
      .then(channels => res.send(channels))
  })

  app.post('/notify/:channel', urlBody, (req, res) => {
    getChannelLabel(req.params.channel)
      .then(title => {
        if(!title) return res.status(404).send('Invalid channel')

        const {text, icon} = req.body
        const payload = JSON.stringify({title, text, icon})

        getSubscriptionByChannel(req.params.channel)
          .then(subscription => {
            if(subscription) {
              webpush.sendNotification(subscription, payload)
                .then(() => res.send('Notified'))
                .catch(err => {
                  console.error(err.stack)
                  res.status(400).send('Unable to send notification')
                })
            } else {
              res.status(404).send('Invalid channel')
            }
          })
      })
  })

  app.listen(80, () => console.log('Listening on 80'))
}

main()