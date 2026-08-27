import { describe, expect, it } from "vitest";
import { apiUrl, normalizeBaseUrl } from "./api";

describe("apiUrl", () => {
    it("usa caminho relativo quando VITE_API_URL não está definida", () => {
        expect(apiUrl("/api/tasks")).toBe("/api/tasks");
    });
});

describe("normalizeBaseUrl", () => {
    it("retorna string vazia quando a base é indefinida ou vazia", () => {
        expect(normalizeBaseUrl(undefined)).toBe("");
        expect(normalizeBaseUrl("")).toBe("");
    });

    it("remove a barra final da base", () => {
        expect(normalizeBaseUrl("https://api.example.com/")).toBe(
            "https://api.example.com",
        );
    });

    it("preserva a base sem barra final", () => {
        expect(normalizeBaseUrl("https://api.example.com")).toBe(
            "https://api.example.com",
        );
    });
});
