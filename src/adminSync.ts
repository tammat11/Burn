import { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Коллекция Firestore, синхронизированная в реальном времени, где каждый
 * элемент — документ с id = item.id. `setValue(next)` считает разницу со
 * последним известным снепшотом и пишет только изменённые/удалённые
 * документы одним batch-запросом — админка может быть открыта в нескольких
 * вкладках/у нескольких администраторов одновременно.
 */
export function useCollectionSync<T extends { id: string }>(
  collectionName: string,
  seed: T[],
) {
  const [value, setValueState] = useState<T[]>(seed);
  const [ready, setReady] = useState(false);
  const seeded = useRef(false);

  useEffect(() => {
    const ref = collection(db, collectionName);
    const unsub = onSnapshot(ref, snapshot => {
      if (snapshot.empty && !seeded.current) {
        // Коллекция пуста — первичное заполнение исходными данными.
        seeded.current = true;
        const batch = writeBatch(db);
        seed.forEach(item => batch.set(doc(db, collectionName, item.id), item as DocumentData));
        batch.commit().catch(() => {});
        return;
      }
      seeded.current = true;
      const items = snapshot.docs.map(item => item.data() as T);
      setValueState(items);
      setReady(true);
    }, () => setReady(true));
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  const setValue = (next: T[]) => {
    setValueState(next);
    const batch = writeBatch(db);
    const nextIds = new Set(next.map(item => item.id));
    const prevIds = new Set(value.map(item => item.id));
    next.forEach(item => batch.set(doc(db, collectionName, item.id), item as DocumentData));
    prevIds.forEach(id => { if (!nextIds.has(id)) batch.delete(doc(db, collectionName, id)); });
    batch.commit().catch(() => {});
  };

  return [value, setValue, ready] as const;
}

/**
 * Один документ Firestore (например config/scoreRules), хранящий значение
 * произвольной формы (объект или массив, обёрнутый в `{ value: ... }`).
 */
export function useDocSync<T>(collectionName: string, docId: string, seed: T) {
  const [value, setValueState] = useState<T>(seed);
  const [ready, setReady] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const ref = doc(db, collectionName, docId);
    const unsub = onSnapshot(ref, snapshot => {
      if (!snapshot.exists()) {
        if (!initialized.current) {
          initialized.current = true;
          setDoc(ref, { value: seed }).catch(() => {});
        }
        return;
      }
      initialized.current = true;
      setValueState((snapshot.data().value as T) ?? seed);
      setReady(true);
    }, () => setReady(true));
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, docId]);

  const setValue = (next: T) => {
    setValueState(next);
    setDoc(doc(db, collectionName, docId), { value: next }).catch(() => {});
  };

  return [value, setValue, ready] as const;
}
