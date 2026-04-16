import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import "server-only";

export const ADMIN_SESSION_COOKIE = "story_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

function getAdminPasswordHash(): string | null {
    const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
    return passwordHash ? passwordHash : null;
}

function getLegacyAdminPassword(): string | null {
    const password = process.env.ADMIN_PASSWORD?.trim();
    return password ? password : null;
}

function getSessionSecret(): string | null {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
    return sessionSecret ? sessionSecret : null;
}

function getScryptOptions() {
    return {
        cost: SCRYPT_COST,
        blockSize: SCRYPT_BLOCK_SIZE,
        parallelization: SCRYPT_PARALLELIZATION,
    };
}

function encodePasswordHash(saltHex: string, hashHex: string): string {
    return `scrypt:${SCRYPT_COST}:${SCRYPT_BLOCK_SIZE}:${SCRYPT_PARALLELIZATION}:${saltHex}:${hashHex}`;
}

function parsePasswordHash(passwordHash: string) {
    const normalizedHash = passwordHash.trim();
    const separator = normalizedHash.includes(":") ? ":" : "$";
    const [algorithm, cost, blockSize, parallelization, saltHex, hashHex] = normalizedHash.split(separator);

    if (
        algorithm !== "scrypt" ||
        !cost ||
        !blockSize ||
        !parallelization ||
        !saltHex ||
        !hashHex
    ) {
        return null;
    }

    const parsedCost = Number(cost);
    const parsedBlockSize = Number(blockSize);
    const parsedParallelization = Number(parallelization);

    if (
        !Number.isInteger(parsedCost) ||
        !Number.isInteger(parsedBlockSize) ||
        !Number.isInteger(parsedParallelization)
    ) {
        return null;
    }

    return {
        saltHex,
        hashHex,
        options: {
            cost: parsedCost,
            blockSize: parsedBlockSize,
            parallelization: parsedParallelization,
        },
    };
}

function sign(value: string): string {
    const sessionSecret = getSessionSecret();

    if (!sessionSecret) {
        throw new Error("Missing ADMIN_SESSION_SECRET environment variable.");
    }

    return createHmac("sha256", sessionSecret).update(value).digest("hex");
}

function safeEquals(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);

    if (aBuffer.length !== bBuffer.length) {
        return false;
    }

    return timingSafeEqual(aBuffer, bBuffer);
}

function verifyAdminPasswordHash(inputPassword: string, passwordHash: string): boolean {
    const parsedHash = parsePasswordHash(passwordHash);

    if (!parsedHash) {
        return false;
    }

    const derivedHash = scryptSync(inputPassword, Buffer.from(parsedHash.saltHex, "hex"), SCRYPT_KEY_LENGTH, parsedHash.options).toString(
        "hex",
    );

    return safeEquals(derivedHash, parsedHash.hashHex);
}

export function createAdminPasswordHash(inputPassword: string): string {
    const normalizedPassword = inputPassword.trim();

    if (!normalizedPassword) {
        throw new Error("Admin password cannot be empty.");
    }

    const saltHex = randomBytes(16).toString("hex");
    const hashHex = scryptSync(normalizedPassword, Buffer.from(saltHex, "hex"), SCRYPT_KEY_LENGTH, getScryptOptions()).toString(
        "hex",
    );

    return encodePasswordHash(saltHex, hashHex);
}

export function getAdminAuthConfigError(): string | null {
    if (!getSessionSecret()) {
        return "Admin auth is not configured. Add ADMIN_SESSION_SECRET to your environment.";
    }

    if (!getAdminPasswordHash() && !getLegacyAdminPassword()) {
        return "Admin auth is not configured. Add ADMIN_PASSWORD_HASH (recommended) or ADMIN_PASSWORD to your environment.";
    }

    return null;
}

export function verifyAdminPassword(inputPassword: string): boolean {
    const normalizedPassword = inputPassword.trim();

    if (!normalizedPassword) {
        return false;
    }

    const passwordHash = getAdminPasswordHash();

    if (passwordHash) {
        return verifyAdminPasswordHash(normalizedPassword, passwordHash);
    }

    const legacyPassword = getLegacyAdminPassword();

    if (!legacyPassword) {
        return false;
    }

    return safeEquals(normalizedPassword, legacyPassword);
}

export function createAdminSessionValue(): string {
    const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
    const payload = String(expiresAt);
    const signature = sign(payload);

    return `${payload}.${signature}`;
}

export function verifyAdminSessionValue(sessionValue: string | undefined): boolean {
    if (!sessionValue) {
        return false;
    }

    if (!getSessionSecret()) {
        return false;
    }

    const [payload, signature] = sessionValue.split(".");

    if (!payload || !signature) {
        return false;
    }

    if (!safeEquals(signature, sign(payload))) {
        return false;
    }

    const expiresAt = Number(payload);

    if (!Number.isFinite(expiresAt)) {
        return false;
    }

    return Date.now() < expiresAt;
}

export function getAdminSessionMaxAge(): number {
    return ADMIN_SESSION_TTL_SECONDS;
}
