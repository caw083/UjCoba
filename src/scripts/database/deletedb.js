// src/scripts/database/deletedb.js

import { openDatabase, CONFIG } from './createdb.js';

class WishlistIDB {
  // Menghapus story dari wishlist berdasarkan ID
  static async removeStoryFromWishlist(storyId) {
    try {
      if (!storyId) {
        throw new Error('ID story tidak valid');
      }

      const db = await openDatabase();
      const transaction = db.transaction([CONFIG.OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      return new Promise((resolve, reject) => {
        // Cek apakah data ada terlebih dahulu
        const getRequest = objectStore.get(storyId);
        
        getRequest.onsuccess = () => {
          const existingData = getRequest.result;
          if (!existingData) {
            reject(new Error('Story tidak ditemukan di wishlist'));
            return;
          }

          // Hapus data jika ada
          const deleteRequest = objectStore.delete(storyId);
          
          deleteRequest.onsuccess = () => {
            resolve({
              success: true,
              message: 'Story berhasil dihapus dari wishlist',
              data: existingData
            });
          };
          
          deleteRequest.onerror = () => {
            reject(new Error('Gagal menghapus story dari wishlist'));
          };
        };
        
        getRequest.onerror = () => {
          reject(new Error('Gagal mengakses data wishlist'));
        };
      });
    } catch (error) {
      throw new Error(`Gagal menghapus dari wishlist: ${error.message}`);
    }
  }

  // Menghapus semua data wishlist
  static async clearAllWishlist() {
    try {
      const db = await openDatabase();
      const transaction = db.transaction([CONFIG.OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = objectStore.clear();
        
        request.onsuccess = () => {
          resolve({
            success: true,
            message: 'Semua wishlist berhasil dihapus'
          });
        };
        
        request.onerror = () => {
          reject(new Error('Gagal menghapus semua wishlist'));
        };
      });
    } catch (error) {
      throw new Error(`Gagal menghapus wishlist: ${error.message}`);
    }
  }

  // Menghapus beberapa story sekaligus berdasarkan array ID
  static async removeBulkFromWishlist(storyIds) {
    try {
      if (!Array.isArray(storyIds) || storyIds.length === 0) {
        throw new Error('Array ID story tidak valid');
      }

      const db = await openDatabase();
      const transaction = db.transaction([CONFIG.OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const results = [];
        let completedCount = 0;
        let hasError = false;

        storyIds.forEach((storyId) => {
          const deleteRequest = objectStore.delete(storyId);
          
          deleteRequest.onsuccess = () => {
            results.push({
              id: storyId,
              success: true,
              message: 'Berhasil dihapus'
            });
            completedCount++;
            
            if (completedCount === storyIds.length && !hasError) {
              resolve({
                success: true,
                message: `${results.length} story berhasil dihapus dari wishlist`,
                data: results
              });
            }
          };
          
          deleteRequest.onerror = () => {
            results.push({
              id: storyId,
              success: false,
              message: 'Gagal dihapus'
            });
            completedCount++;
            hasError = true;
            
            if (completedCount === storyIds.length) {
              reject(new Error('Beberapa story gagal dihapus'));
            }
          };
        });
      });
    } catch (error) {
      throw new Error(`Gagal menghapus bulk wishlist: ${error.message}`);
    }
  }
}

export default WishlistIDB;