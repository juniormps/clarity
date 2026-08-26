//Erro HTTP tipado, compartilhado pelos services para permitir distinguir
//status específicos (ex.: 401) de outros tipos de erro, sem parsear texto.
export class HttpError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

//Identifica um erro de sessão expirada/autenticação inválida.
export function isUnauthorizedError(error: unknown): error is HttpError {
    return error instanceof HttpError && error.status === 401;
}
