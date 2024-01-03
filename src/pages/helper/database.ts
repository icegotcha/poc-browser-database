export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("gallery", 1);

    request.onerror = (event: Event) => {
      reject(
        `IndexedDB initialization error: ${
          (event.target as IDBOpenDBRequest).error
        }`
      );
    };

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("picture")) {
        db.createObjectStore("picture", { keyPath: "id" });
      }
    };
  });
};

export const addItemsToDatabase = async (
  db: IDBDatabase,
  item: any
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("picture", "readwrite");
    const store = transaction.objectStore("picture");
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event: Event) => {
      reject(
        `IndexedDB transaction error: ${(event.target as IDBTransaction).error}`
      );
    };
    store.add(item);
    transaction.commit();
  });
};

export const getItemsFromDatabase = (db: IDBDatabase): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("picture", "readonly");
    const store = transaction.objectStore("picture");
    const request = store.getAll();
    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBRequest).result);
    };
    request.onerror = (event: Event) => {
      reject(`IndexedDB request error: ${(event.target as IDBRequest).error}`);
    };
  });
};

export const searchItemsFromDatabase = (
  db: IDBDatabase,
  keyword: string
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("picture", "readonly");
    const store = transaction.objectStore("picture");
    const request = store.openCursor();
    const result: any[] = [];
    request.onsuccess = function (event) {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const data = cursor.value as any;
        if (data.name.indexOf(keyword) !== -1) {
          result.push(data);
        }
        cursor.continue();
      } else {
        resolve(result);
      }
    };
    request.onerror = (event: Event) => {
      reject(`IndexedDB request error: ${(event.target as IDBRequest).error}`);
    };
  });
};
