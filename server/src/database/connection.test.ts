import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { buildSslConfig } from "./connection.js";

const CA_PEM = [
    "-----BEGIN CERTIFICATE-----",
    "MIIBfakeCertificateContentForUnitTestOnly",
    "-----END CERTIFICATE-----",
].join("\n");

describe("buildSslConfig", () => {
    it("retorna undefined quando nenhum caminho de CA é informado", () => {
        expect(buildSslConfig(undefined)).toBeUndefined();
        expect(buildSslConfig("")).toBeUndefined();
    });

    it("lê o certificado indicado e retorna a configuração SSL", () => {
        const dir = mkdtempSync(join(tmpdir(), "clarity-ca-"));
        const caPath = join(dir, "ca.pem");

        try {
            writeFileSync(caPath, CA_PEM);

            expect(buildSslConfig(caPath)).toEqual({ ssl: { ca: CA_PEM } });
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});
