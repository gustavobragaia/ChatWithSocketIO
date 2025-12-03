import express from 'express';
import type { Request, Response } from 'express';

// Request com usuário já validado pelo authMiddleware
interface AuthedRequest extends Request {
  user?: {
    userId: string;
    nickname?: string;
    [key: string]: unknown;
  };
}

export const ProtectedRouter = express.Router();

ProtectedRouter.get('/me', (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { userId, nickname, ...rest } = req.user;
  return res.json({ userId, nickname, ...rest });
});

ProtectedRouter.get('/ping', (_req: AuthedRequest, res: Response) => {
  res.json({ status: 'ok', ts: Date.now() });
});
