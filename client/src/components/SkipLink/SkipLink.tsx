import styles from "./SkipLink.module.css";

function SkipLink() {
    return (
        <a className={styles.skipLink} href="#conteudo-principal">
            Ir para o conteúdo
        </a>
    );
}

export default SkipLink;
