import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createLoginRateLimiter, createRegisterRateLimiter } from "./rateLimiters.js";

describe("createLoginRateLimiter", () => {
    it("retorna 429 após exceder o limite de tentativas malsucedidas", async () => {
        const app = express();
        app.use(createLoginRateLimiter({ windowMs: 60_000, limit: 2 }));
        app.post("/login", (_req, res) => res.status(401).json({ error: "Invalid" }));

        const first = await request(app).post("/login").send({});
        const second = await request(app).post("/login").send({});
        const third = await request(app).post("/login").send({});

        expect(first.status).toBe(401);
        expect(second.status).toBe(401);
        expect(third.status).toBe(429);
        expect(third.body).toEqual({ error: "Too many requests. Please try again later." });
    });

    it("não penaliza logins bem-sucedidos (skipSuccessfulRequests)", async () => {
        const app = express();
        app.use(createLoginRateLimiter({ windowMs: 60_000, limit: 1 }));
        app.post("/login", (_req, res) => res.status(200).json({ data: {} }));

        for (let i = 0; i < 5; i++) {
            const response = await request(app).post("/login").send({});
            expect(response.status).toBe(200);
        }
    });

    it("emite headers draft-7 e omite headers legados", async () => {
        const app = express();
        app.use(createLoginRateLimiter({ windowMs: 60_000, limit: 1 }));
        app.get("/", (_req, res) => res.status(200).send("ok"));

        const response = await request(app).get("/");

        expect(response.headers["ratelimit-policy"]).toBe("1;w=60");
        expect(response.headers["ratelimit"]).toContain("limit=1");
        expect(response.headers["x-ratelimit-limit"]).toBeUndefined();
        expect(response.headers["x-ratelimit-remaining"]).toBeUndefined();
    });
});

describe("createRegisterRateLimiter", () => {
    it("conta todas as requisições e retorna 429 após o limite", async () => {
        const app = express();
        app.use(createRegisterRateLimiter({ windowMs: 60_000, limit: 2 }));
        app.post("/users", (_req, res) => res.status(201).json({ data: {} }));

        const first = await request(app).post("/users").send({});
        const second = await request(app).post("/users").send({});
        const third = await request(app).post("/users").send({});

        expect(first.status).toBe(201);
        expect(second.status).toBe(201);
        expect(third.status).toBe(429);
        expect(third.body).toEqual({ error: "Too many requests. Please try again later." });
    });
});
