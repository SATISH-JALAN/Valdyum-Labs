import express from 'express';

const app = express();
const PORT = Number(process.env.WEBHOOK_PORT || process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'valdyum-webhook-server',
    timestamp: new Date().toISOString(),
  });
});

app.post('/webhook', (req, res) => {
  console.log('[webhook] received payload:');
  console.log(JSON.stringify(req.body, null, 2));

  // TODO: add MEV / alerts / DB logic here.
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`[webhook] server running on port ${PORT}`);
  console.log(`[webhook] POST http://localhost:${PORT}/webhook`);
});
