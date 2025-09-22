// src/scripts/database/editdb.js

import { openDatabase, CONFIG } from './createdb.js';

class WishlistIDB {
  // Menambahkan story ke wishlist
  static async addStoryToWishlist(story) {
    try {
      // Validasi data story
      if (!story || !story.id) {
        throw new Error('Data story tidak valid');
      }

      // Pastikan story memiliki struktur yang benar
      const wishlistItem = {
        id: story.id,
        name: story.name || '',
        description: story.description || '',
        photoUrl: story.photoUrl || '',
        createdAt: story.createdAt || new Date().toISOString(),
        lat: story.lat || null,
        lon: story.lon || null,
        addedToWishlistAt: new Date().toISOString() // Tambahan timestamp kapan ditambahkan ke wishlist
      };

      const db = await openDatabase();
      const transaction = db.transaction([CONFIG.OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      return new Promise((resolve, reject) => {
        const request = objectStore.add(wishlistItem);
        
        request.onsuccess = () => {
          resolve({
            success: true,
            message: 'Story berhasil ditambahkan ke wishlist',
            data: wishlistItem
          });
        };
        
        request.onerror = () => {
          // Jika error karena data sudah ada
          if (request.error.name === 'ConstraintError') {
            reject(new Error('Story sudah ada di wishlist'));
          } else {
            reject(new Error('Gagal menambahkan story ke wishlist'));
          }
        };
      });
    } catch (error) {
      throw new Error(`Gagal menambahkan ke wishlist: ${error.message}`);
    }
  }

  // Mengupdate story yang sudah ada di wishlist
  static async updateWishlistItem(story) {
    try {
      if (!story || !story.id) {
        throw new Error('Data story tidak valid');
      }

      const db = await openDatabase();
      const transaction = db.transaction([CONFIG.OBJECT_STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(CONFIG.OBJECT_STORE_NAME);
      
      return new Promise((resolve, reject) => {
        // Ambil data yang sudah ada terlebih dahulu
        const getRequest = objectStore.get(story.id);
        
        getRequest.onsuccess = () => {
          const existingData = getRequest.result;
          if (!existingData) {
            reject(new Error('Story tidak ditemukan di wishlist'));
            return;
          }

          // Update data dengan mempertahankan addedToWishlistAt
          const updatedItem = {
            ...existingData,
            ...story,
            addedToWishlistAt: existingData.addedToWishlistAt, // Pertahankan timestamp asli
            updatedAt: new Date().toISOString() // Tambah timestamp update
          };

          const putRequest = objectStore.put(updatedItem);
          
          putRequest.onsuccess = () => {
            resolve({
              success: true,
              message: 'Story berhasil diupdate di wishlist',
              data: updatedItem
            });
          };
          
          putRequest.onerror = () => {
            reject(new Error('Gagal mengupdate story di wishlist'));
          };
        };
        
        getRequest.onerror = () => {
          reject(new Error('Gagal mengambil data story dari wishlist'));
        };
      });
    } catch (error) {
      throw new Error(`Gagal mengupdate wishlist: ${error.message}`);
    }
  }
}

export default WishlistIDB;