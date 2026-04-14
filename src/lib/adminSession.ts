import { createHmac, timingSafeEqual } from "crypto";
import "server-only";

export const ADMIN_SESSION_COOKIE = "story_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

function getAdminPassword(): string {
    return process.env.ADMIN_PASSWORD ?? "81035813148823810058";
}

function getSessionSecret(): string {
    return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "dev-change-admin-session-secret";
}

function sign(value: string): string {
    return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeEquals(a: string, b: string): boolean {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);

    if (aBuffer.length !== bBuffer.length) {
        return false;
    }

    return timingSafeEqual(aBuffer, bBuffer);
}

export function verifyAdminPassword(inputPassword: string): boolean {
    const expectedPassword = getAdminPassword();

    if (!expectedPassword || !inputPassword) {
        return false;
    }

    return safeEquals(inputPassword, expectedPassword);
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
