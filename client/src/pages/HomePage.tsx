import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Clarity</h1>
      <p className={styles.subtitle}>Task management made clear</p>
    </main>
  );
}
