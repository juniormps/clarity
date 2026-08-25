import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../app/hooks";
import { setAuthenticatedUser } from "../features/auth/authSlice";
import { loginUser } from "../services/authService";
import styles from "./AuthPage.module.css";

interface LoginFormValues {
    email: string;
    password: string;
}

type FieldName = keyof LoginFormValues;

type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialValues: LoginFormValues = {
    email: "",
    password: "",
};

//Valida os dados do formulário de login, espelhando as regras relevantes do backend.
function validate(values: LoginFormValues): FieldErrors {

    const errors: FieldErrors = {};

    const email = values.email.trim();

    if (email.length === 0) {
        errors.email = "Informe seu e-mail.";
    } else if (email.length > 255) {
        errors.email = "O e-mail deve ter no máximo 255 caracteres.";
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = "Informe um e-mail válido.";
    }

    if (values.password.length === 0) {
        errors.password = "Informe sua senha.";
    } else if (values.password.length > 128) {
        errors.password = "A senha deve ter no máximo 128 caracteres.";
    }

    return errors;
}

function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [values, setValues] = useState<LoginFormValues>(initialValues);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(field: FieldName, value: string) {

        setValues((previous) => ({ ...previous, [field]: value }));

        setFieldErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];
            return next;
        });

        setSubmitError(null);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const errors = validate(values);

        setFieldErrors(errors);
        setSubmitError(null);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            const user = await loginUser({
                email: values.email.trim(),
                password: values.password,
            });

            dispatch(setAuthenticatedUser(user));
            navigate("/app", { replace: true });

        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Não foi possível entrar.");
            
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className={styles.main}>
            <div className={styles.card}>
                <h1 className={styles.title}>Entrar</h1>

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">E-mail</label>
                        <input
                            className={styles.input}
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            maxLength={255}
                            value={values.email}
                            aria-invalid={fieldErrors.email ? true : undefined}
                            aria-describedby={fieldErrors.email ? "email-error" : undefined}
                            onChange={(event) => handleChange("email", event.target.value)}
                        />
                        {fieldErrors.email && (
                            <p className={styles.fieldError} id="email-error">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="password">Senha</label>
                        <input
                            className={styles.input}
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            maxLength={128}
                            value={values.password}
                            aria-invalid={fieldErrors.password ? true : undefined}
                            aria-describedby={fieldErrors.password ? "password-error" : undefined}
                            onChange={(event) => handleChange("password", event.target.value)}
                        />
                        {fieldErrors.password && (
                            <p className={styles.fieldError} id="password-error">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    <button
                        className={styles.submitButton}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                {submitError && (
                    <p className={styles.submitError} role="alert">
                        {submitError}
                    </p>
                )}

                <p className={styles.footer}>
                    Ainda não possui uma conta?{" "}
                    <Link className={styles.footerLink} to="/register">
                        Criar conta
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default LoginPage;
