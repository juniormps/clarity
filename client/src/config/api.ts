//Centraliza a construção da URL da API. O fluxo padrão usa caminhos relativos
//`/api` tanto em desenvolvimento quanto em produção: no desenvolvimento o Vite
//faz o proxy e, em produção, a Vercel faz o proxy para o Render. VITE_API_URL
//continua suportada como base opcional, mas não é necessária no deploy atual.
const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

//Remove barras finais de uma URL base, retornando string vazia quando o valor
//não é informado para preservar os caminhos relativos `/api`.
export function normalizeBaseUrl(rawUrl: string | undefined): string {
    if (!rawUrl) {
        return "";
    }

    return rawUrl.replace(/\/+$/, "");
}

//Prefixa um caminho da API com a base configurada, quando existir.
export function apiUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
}
