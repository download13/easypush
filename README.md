Setup
-----

Create `.env` file in root with

```
JWT_SECRET="a random string (i use a uuid)"
VAPID_CONTACT="mailto:youremail"
VAPID_PRIVATE_KEY="generate keys with"
VAPID_PUBLIC_KEY="npx web-push generate-vapid-keys"
```

Development
-----------
`npm run watch:server`
`npm run watch:client`
`npm start`


Production
----------
`docker-compose build && docker-compose up -d`