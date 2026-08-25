import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// O JSDOM não implementa a API modal do <dialog> (showModal/close).
// Este polyfill mínimo cobre apenas o necessário para os testes,
// sem alterar a implementação de produção.
if (typeof window !== "undefined" && "HTMLDialogElement" in window) {
    const proto = window.HTMLDialogElement.prototype;

    if (typeof proto.showModal !== "function") {
        proto.showModal = function showModal(this: HTMLDialogElement) {
            this.open = true;
        };
    }

    if (typeof proto.close !== "function") {
        proto.close = function close(this: HTMLDialogElement) {
            this.open = false;
        };
    }
}

afterEach(() => {
    cleanup();
});
