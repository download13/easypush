import type { Request, Response, NextFunction } from 'express'

export function usersOnly(req: Request, res: Response, next: NextFunction): void {
  if(req.user) next()
  else res.status(401).send('Unauthorized')
}

type Subscription = {
  endpoint: string,
  keys: {
    p256dh: string,
    auth: string
  }
}

export function isSubscription(obj: unknown): obj is Subscription {
  const s = obj as Subscription
  return (
    obj &&
    typeof obj === 'object' &&
    typeof s.endpoint === 'string' &&
    typeof s.keys === 'object' &&
    typeof s.keys.auth === 'string' &&
    typeof s.keys.p256dh === 'string'
  )
}