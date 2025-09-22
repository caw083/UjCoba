// src/scripts/database/createdb.js

const CONFIG = {
  DATABASE_NAME: 'wishlist-database',
  DATABASE_VERSION: 1,
  OBJECT_STORE_NAME: 'wishlist',
};

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Browser tidak mendukung IndexedDB'));
      return;
    }

    const request = indexedDB.open(CONFIG.DATABASE_NAME, CONFIG.DATABASE_VERSION);

    request.onerror = () => {
      reject(new Error('Gagal membuka database'));
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Hapus object store lama jika ada
      if (db.objectStoreNames.contains(CONFIG.OBJECT_STORE_NAME)) {
        db.deleteObjectStore(CONFIG.OBJECT_STORE_NAME);
      }

      // Buat object store baru
      const objectStore = db.createObjectStore(CONFIG.OBJECT_STORE_NAME, {
        keyPath: 'id'
      });

      // Buat index untuk pencarian yang lebih efisien
      objectStore.createIndex('name', 'name', { unique: false });
      objectStore.createIndex('createdAt', 'createdAt', { unique: false });
    };
  });
};

export { openDatabase, CONFIG };