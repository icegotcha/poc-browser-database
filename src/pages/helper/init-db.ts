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
        db.createObjectStore("picture");
      }
    };
  });
};
