import 'dotenv/config';
import { app } from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🏥 CHIKITSA-X Enterprise Healthcare API Server LIVE`);
  console.log(`🔒 Zero-Trust Data Security: AES-256-GCM + HMAC Audit Ledger`);
  console.log(`🌐 Listening on: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=============================================================\n`);
});
