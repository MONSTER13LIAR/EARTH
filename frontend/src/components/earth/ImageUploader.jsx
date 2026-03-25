import { useState } from "react";
import styles from "./ImageUploader.module.css";

export default function ImageUploader({ onFileSelected }) {
  const [preview, setPreview] = useState("");

  const onChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelected?.(file);
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.uploadLabel}>
        <input type="file" accept="image/*" onChange={onChange} className={styles.fileInput} />
        <span className={styles.uploadButton}>Upload Label Image</span>
      </label>

      {preview && <img src={preview} alt="Uploaded preview" className={styles.preview} />}
    </div>
  );
}
