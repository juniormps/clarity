import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import styles from "./AuthPage.module.css";

interface RegisterFormValues {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

type FieldName = keyof RegisterFormValues;

type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialValues: RegisterFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
};

//Valida os dados do formulário, espelhando as regras relevantes do backend.
function validate(values: RegisterFormValues): FieldErrors {
    const errors: FieldErrors = {};

    const firstName = values.firstName.trim();

    if (firstName.length === 0) {
        errors.firstName = "Informe seu nome.";
    } else if (firstName.length > 120) {
        errors.firstName = "O nome deve ter no máximo 120 caracteres.";
    }

    const lastName = values.lastName.trim();

    if (lastName.length === 0) {
        errors.lastName = "Informe seu sobrenome.";
    } else if (lastName.length > 120) {
        errors.lastName = "O sobrenome deve ter no máximo 120 caracteres.";
    }

    const email = values.email.trim();

    if (email.length === 0) {
        errors.email = "Informe seu e-mail.";
    } else if (email.length > 255) {
        errors.email = "O e-mail deve ter no máximo 255 caracteres.";
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = "Informe um e-mail válido.";
    }

    const password = values.password;

    if (password.length < 8) {
        errors.password = "A senha deve ter pelo menos 8 caracteres.";
    } else if (password.length > 128) {
        errors.password = "A senha deve ter no máximo 128 caracteres.";
    } else if (password.trim().length === 0) {
        errors.password = "A senha não pode conter apenas espaços.";
    }

    if (values.passwordConfirmation !== password) {
        errors.passwordConfirmation = "As senhas não coincidem.";
    }

    return errors;
}

function RegisterPage() {
    
    const navigate = useNavigate();

    const [values, setValues] = useState<RegisterFormValues>(initialValues);
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
            await registerUser({
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email.trim(),
                password: values.password,
                passwordConfirmation: values.passwordConfirmation,
            });

            navigate("/login", { replace: true });
            
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível criar a conta.",
            );
            setIsSubmitting(false);
        }
    }

    return (
        <main id="conteudo-principal" className={styles.main} tabIndex={-1}>
            <div className={styles.card}>
                <h1 className={styles.title}>Criar conta</h1>

                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="firstName">Nome</label>
                        <input
                            className={styles.input}
                            id="firstName"
                            name="firstName"
                            type="text"
                            autoComplete="given-name"
                            maxLength={120}
                            value={values.firstName}
                            aria-invalid={fieldErrors.firstName ? true : undefined}
                            aria-describedby={
                                fieldErrors.firstName ? "firstName-error" : undefined
                            }
                            onChange={(event) => handleChange("firstName", event.target.value)}
                        />
                        {fieldErrors.firstName && (
                            <p className={styles.fieldError} id="firstName-error">
                                {fieldErrors.firstName}
                            </p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="lastName">Sobrenome</label>
                        <input
                            className={styles.input}
                            id="lastName"
                            name="lastName"
                            type="text"
                            autoComplete="family-name"
                            maxLength={120}
                            value={values.lastName}
                            aria-invalid={fieldErrors.lastName ? true : undefined}
                            aria-describedby={
                                fieldErrors.lastName ? "lastName-error" : undefined
                            }
                            onChange={(event) => handleChange("lastName", event.target.value)}
                        />
                        {fieldErrors.lastName && (
                            <p className={styles.fieldError} id="lastName-error">
                                {fieldErrors.lastName}
                            </p>
                        )}
                    </div>

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
                            aria-describedby={
                                fieldErrors.email ? "email-error" : undefined
                            }
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
                            autoComplete="new-password"
                            maxLength={128}
                            value={values.password}
                            aria-invalid={fieldErrors.password ? true : undefined}
                            aria-describedby={
                                fieldErrors.password ? "password-error" : undefined
                            }
                            onChange={(event) => handleChange("password", event.target.value)}
                        />
                        {fieldErrors.password && (
                            <p className={styles.fieldError} id="password-error">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="passwordConfirmation">
                            Confirmar senha
                        </label>
                        <input
                            className={styles.input}
                            id="passwordConfirmation"
                            name="passwordConfirmation"
                            type="password"
                            autoComplete="new-password"
                            maxLength={128}
                            value={values.passwordConfirmation}
                            aria-invalid={
                                fieldErrors.passwordConfirmation ? true : undefined
                            }
                            aria-describedby={
                                fieldErrors.passwordConfirmation
                                    ? "passwordConfirmation-error"
                                    : undefined
                            }
                            onChange={(event) =>
                                handleChange("passwordConfirmation", event.target.value)
                            }
                        />
                        {fieldErrors.passwordConfirmation && (
                            <p
                                className={styles.fieldError}
                                id="passwordConfirmation-error"
                            >
                                {fieldErrors.passwordConfirmation}
                            </p>
                        )}
                    </div>

                    <button
                        className={styles.submitButton}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Criando conta..." : "Criar conta"}
                    </button>
                </form>

                {submitError && (
                    <p className={styles.submitError} role="alert">
                        {submitError}
                    </p>
                )}

                <p className={styles.footer}>
                    Já possui uma conta?{" "}
                    <Link className={styles.footerLink} to="/login">
                        Entrar
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default RegisterPage;
