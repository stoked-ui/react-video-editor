import { useEffect, useState } from 'react';

interface IIndexedDbServiceProps {
  dbName: string;
  storeName: string;
}

export class IndexedDbServiceProps implements IIndexedDbServiceProps {
  dbName: string;
  storeName: string;

  constructor(dbName: string, storeName: string) {
    this.dbName = dbName;
    this.storeName = storeName;
  }
}

function IndexedDBService(props: IIndexedDbServiceProps) {
  function openDatabase(props: IIndexedDbServiceProps): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(props.dbName, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(props.storeName)) {
          db.createObjectStore(props.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  const [db, setDb] = useState<IDBDatabase | null>(null);
  /*useEffect(() => {
    // React advises to declare the async function directly inside useEffect
    async function getToken() {
      const idb = await openDatabase(props);
      setDb(idb);
    }

    if (!db) {
      getToken();
    }
  }, [db, setDb]);*/

  function getItem<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (db === null) {
        reject('Database not initialized');
        return;
      }
      const transaction = db.transaction([props.storeName], 'readonly');
      const store = transaction.objectStore(props.storeName);
      const request = store.get(key);

      request.onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result ? result.data : null);
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  function setItem<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (db === null) {
        reject('Database not initialized');
        return;
      }

      const transaction = db.transaction([props.storeName], 'readwrite');
      const store = transaction.objectStore(props.storeName);
      const request = store.put({ id: key, data: value });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  return { initialized: !!db, setItem, getItem };
}

export default IndexedDBService;
