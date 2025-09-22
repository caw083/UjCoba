// src/scripts/database/readdb.js

import { openDatabase, CONFIG } from './createdb.js';

class WishlistIDB {
  // Mendapatkan semua data wishlist
  static async getAllWishlist() {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([CONFIG.OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(new Error('Gagal mengambil data wishlist'));
        };
      });
    } catch (error) {
      throw new Error(`Gagal mengambil wishlist: ${error.message}`);
    }
  }

  // Mendapatkan wishlist berdasarkan ID
  static async getWishlistById(id) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([CONFIG.OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = objectStore.get(id);
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(new Error('Gagal mengambil data wishlist'));
        };
      });
    } catch (error) {
      throw new Error(`Gagal mengambil wishlist: ${error.message}`);
    }
  }

  // Mengecek apakah story ada di wishlist
  static async isStoryInWishlist(storyId) {
    try {
      const story = await this.getWishlistById(storyId);
      return story !== undefined;
    } catch (error) {
      return false;
    }
  }

  // Mencari wishlist berdasarkan nama
  static async searchWishlistByName(name) {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([CONFIG.OBJECT_STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(CONFIG.OBJECT_STORE_NAME);
      const index = objectStore.index('name');
      
      return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(name));
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(new Error('Gagal mencari wishlist'));
        };
      });
    } catch (error) {
      throw new Error(`Gagal mencari wishlist: ${error.message}`);
    }
  }
}

export default WishlistIDB;