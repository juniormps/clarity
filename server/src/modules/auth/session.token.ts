import { createHash, randomBytes } from "node:crypto";

//Gera um token de sessão opaco com 256 bits de entropia.
export function generateSessionToken(): string {
    return randomBytes(32).toString("base64url");
}

//Gera o hash SHA-256 do token, usado para persistir a sessão sem o token real.
export function hashSessionToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}
