import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ConfirmationModal from "./ConfirmationModal";

interface ModalProps {
    isOpen?: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
}

function renderModal(overrides: ModalProps = {}) {
    const onConfirm = vi.fn<() => void>();
    const onCancel = vi.fn<() => void>();

    const view = render(
        <ConfirmationModal
            isOpen={overrides.isOpen ?? true}
            title={overrides.title ?? "Excluir tarefa?"}
            message={overrides.message ?? "Tem certeza de que deseja excluir?"}
            confirmLabel={overrides.confirmLabel ?? "Excluir"}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />,
    );

    return { view, onConfirm, onCancel };
}

describe("ConfirmationModal", () => {
    it("não aparece quando fechado", () => {
        const { view } = renderModal({ isOpen: false });

        expect(view.container.querySelector("dialog")).not.toHaveAttribute("open");
    });

    it("aparece quando aberto", () => {
        renderModal({ isOpen: true });

        expect(screen.getByRole("dialog")).toHaveAttribute("open");
    });

    it("renderiza título e mensagem", () => {
        renderModal({
            title: "Excluir tarefa?",
            message: "Esta ação não pode ser desfeita.",
        });

        expect(
            screen.getByRole("heading", { name: "Excluir tarefa?" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Esta ação não pode ser desfeita.")).toBeInTheDocument();
    });

    it("botão Cancelar executa onCancel", async () => {
        const user = userEvent.setup();
        const { onCancel } = renderModal();

        await user.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("botão de confirmação executa onConfirm", async () => {
        const user = userEvent.setup();
        const { onConfirm } = renderModal();

        await user.click(screen.getByRole("button", { name: "Excluir" }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("Escape (evento cancel) executa cancelamento", () => {
        const { onCancel } = renderModal();

        fireEvent(screen.getByRole("dialog"), new Event("cancel"));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("possui semântica acessível de diálogo", () => {
        renderModal({ title: "Excluir tarefa?" });

        const dialog = screen.getByRole("dialog", {
            name: "Excluir tarefa?",
        });

        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute("aria-labelledby");
        expect(dialog).toHaveAttribute("aria-describedby");
    });
});
