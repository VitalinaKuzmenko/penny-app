import styles from "./page.module.css";
import UploadCSV from "./UploadCSV";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <UploadCSV />
      </main>
    </div>
  );
}
