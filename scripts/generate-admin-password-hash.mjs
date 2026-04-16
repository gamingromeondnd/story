import { randomBytes, scryptSync } from "node:crypto";

const inputPassword = process.argv[2]?.trim() ?? "";

if (!inputPassword) {
    console.error('Usage: npm run admin:hash -- "your-strong-password"');
    process.exit(1);
}

const cost = 16384;
const blockSize = 8;
const parallelization = 1;
const keyLength = 64;
const saltHex = randomBytes(16).toString("hex");
const hashHex = scryptSync(inputPassword, Buffer.from(saltHex, "hex"), keyLength, {
    cost,
    blockSize,
    parallelization,
}).toString("hex");

console.log(`scrypt:${cost}:${blockSize}:${parallelization}:${saltHex}:${hashHex}`);
