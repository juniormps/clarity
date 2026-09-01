import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../../src/app.js";

//Em desenvolvimento/teste, sem CLIENT_ORIGIN definido, o servidor assume a
//origem local do Vite. O teste comprova o comportamento do middleware cors.
const CLIENT_ORIGIN = "http://localhost:5173";

describe("CORS", () => {
    it("permite a origem configurada com credenciais", async () => {
        const response = await request(app)
            .get("/api/nao-existe")
            .set("Origin", CLIENT_ORIGIN);

        expect(response.headers["access-control-allow-origin"]).toBe(CLIENT_ORIGIN);
        expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("responde ao preflight OPTIONS com os cabeçalhos CORS", async () => {
        const response = await request(app)
            .options("/api/tasks")
            .set("Origin", CLIENT_ORIGIN)
            .set("Access-Control-Request-Method", "PATCH");

        expect(response.status).toBe(204);
        expect(response.headers["access-control-allow-origin"]).toBe(CLIENT_ORIGIN);
        expect(response.headers["access-control-allow-credentials"]).toBe("true");
        expect(response.headers["access-control-allow-methods"]).toBeDefined();
    });

    it("não autoriza uma origem arbitrária", async () => {
        const response = await request(app)
            .get("/api/nao-existe")
            .set("Origin", "http://evil.example.com");

        expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
});
