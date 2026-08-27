//Centraliza a construção da URL da API, permitindo que o client funcione em
//desenvolvimento (caminho relativo `/api` via proxy do Vite) e em produção
//(URL absoluta configurável via VITE_API_URL) sem hardcode de um host.
const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL);

//Remove barras finais de uma URL base, retornando string vazia quando o valor
//não é informado (desenvolvimento) para preservar os caminhos relativos.
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
