import { describe, expect, it } from "vitest";
import { generateSessionToken, hashSessionToken } from "./session.token.js";

describe("generateSessionToken", () => {
    it("gera um token não vazio", () => {
        expect(generateSessionToken().length).toBeGreaterThan(0);
    });

    it("gera tokens diferentes em chamadas consecutivas", () => {
        expect(generateSessionToken()).not.toBe(generateSessionToken());
    });
});

describe("hashSessionToken", () => {
    it("é determinístico", () => {
        expect(hashSessionToken("token")).toBe(hashSessionToken("token"));
    });

    it("produz 64 caracteres hexadecimais", () => {
        expect(hashSessionToken("token")).toMatch(/^[0-9a-f]{64}$/);
    });

    it("difere do token original", () => {
        const token = "opaque-token";
        expect(hashSessionToken(token)).not.toBe(token);
    });
});
