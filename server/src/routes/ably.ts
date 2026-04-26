import { Router, Request, Response } from 'express';
import Ably from 'ably';

const router: Router = Router();

router.get('/token', async (_req: Request, res: Response) => {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'Ably is not configured on this server.' });
    return;
  }

  try {
    const client = new Ably.Rest({ key: apiKey });

    // Scope the token to subscribe-only on the marketplace channel so the
    // browser cannot accidentally publish server-side events.
    const tokenRequest = await client.auth.createTokenRequest({
      capability: { marketplace: ['subscribe'], 'marketplace:*': ['subscribe'] },
      ttl: 3_600_000, // 1 hour in ms
    });

    res.json(tokenRequest);
  } catch (err) {
    console.error('[Ably token] Error generating token request:', err);
    res.status(500).json({ error: 'Failed to generate Ably token.' });
  }
});

export default router;
