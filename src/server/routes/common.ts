import type { NextFunction, Request, Response } from 'express'

export function isSubscription(obj: unknown): obj is PushSubscriptionJSON {
	const s = obj as PushSubscriptionJSON
	return (
		obj &&
		typeof obj === 'object' &&
		typeof s.endpoint === 'string' &&
		typeof s.keys === 'object' &&
		typeof s.keys.auth === 'string' &&
		typeof s.keys.p256dh === 'string'
	)
}

export function keyRequired(req: Request, res: Response, next: NextFunction) {
	const key = req.header('authorization')
	if(key && typeof key === 'string' && key.length === 36) {
		req['authKey'] = key
		next()
	} else {
		res.status(400).send('Invalid key')
	}
}

export function getKey(req: Request): string | undefined {
	const key = req.header('authorization')
	if(key && typeof key === 'string' && key.length === 36) {
		return key
	}
}

export function getChannelId(str?: string): string | undefined {
	if(str && typeof str === 'string' && str.length >= 10) {
		return str
	}
}