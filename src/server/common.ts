import type { Request, Response, NextFunction } from 'express'

export function usersOnly(req: Request, res: Response, next: NextFunction) {
  if(req.user) next()
  else res.status(401).send('Unauthorized')
}
