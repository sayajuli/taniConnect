import midtransClient from 'midtrans-client';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'apps/backend/.env' });

export const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY as string,
    clientKey: process.env.MIDTRANS_CLIENT_KEY as string
});