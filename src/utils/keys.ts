import { Env } from 'src/config/env-loader';
import * as fs from 'fs'

const {PRIVATE_KEY_FILE, PUBLIC_KEY_FILE } = Env();

export const privateKey = fs.readFileSync(PRIVATE_KEY_FILE);
export const publicKey = fs.readFileSync(PUBLIC_KEY_FILE);
