export interface AuthContext {
    userId: number;
}

declare global {
    namespace Express {
        interface Request {
            auth?: AuthContext;
        }
    }
}
