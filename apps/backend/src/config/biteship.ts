import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config({ path: 'apps/backend/.env' });

export const biteship = axios.create({
    baseURL: 'https://api.biteship.com/v1',
    headers: {
        'Authorization': process.env.BITESHIP_API_KEY as string
    }
});