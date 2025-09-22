// src/scripts/views/pages/daftarWishlist.js

import WishlistIDB from '../../database/readdb.js';
import WishlistDeleteIDB from '../../database/deletedb.js';

export default class DaftarWishlist {
  async render() {
    return `
      <div class="content">
        <div class="hero">
          <div class="hero__inner">
            <h1 class="hero__title">Daftar Wishlist</h1>
            <p class="hero__tagline">
              Kumpulan story favorit yang telah Anda simpan
            </p>
          </div>
        </div>
        
        <div class="wishlist-container">
          <div class="wishlist-actions">
            <button id="clear-all-wishlist" class="btn btn-danger">
              <i class="fas fa-trash"></i> Hapus Semua
            </button>
            <div class="wishlist-count">
              <span id="wishlist-counter">0</span> Story di Wishlist
            </div>
          </div>
          
          <div id="wishlist-content">
            <div class="loading">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Memuat wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    await this._renderWishlistContent();
    this._initializeEventListeners();
  }

  async _renderWishlistContent() {
    const wishlistContainer = document.querySelector('#wishlist-content');
    const wishlistCounter = document.querySelector('#wishlist-counter');
    
    try {
      const wishlistData = await WishlistIDB.getAllWishlist();
      
      if (wishlistData.length === 0) {
        wishlistContainer.innerHTML = this._createEmptyWishlistTemplate();
        wishlistCounter.textContent = '0';
        return;
      }

      // Urutkan berdasarkan tanggal ditambahkan ke wishlist (terbaru dulu)
      const sortedWishlist = wishlistData.sort((a, b) => 
        new Date(b.addedToWishlistAt || b.createdAt) - new Date(a.addedToWishlistAt || a.createdAt)
      );

      wishlistContainer.innerHTML = `
        <div class="stories-grid">
          ${sortedWishlist.map((story) => this._createWishlistItemTemplate(story)).join('')}
        </div>
      `;
      
      wishlistCounter.textContent = wishlistData.length;
      
      // Initialize remove buttons
      this._initializeRemoveButtons();
      
    } catch (error) {
      console.error('Error loading wishlist:', error);
      wishlistContainer.innerHTML = this._createErrorTemplate(error.message);
      wishlistCounter.textContent = '0';
    }
  }

  _createWishlistItemTemplate(story) {
    const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image';
    const storyImage = story.photoUrl || defaultImage;
    const storyName = story.name || 'Nama tidak tersedia';
    const storyDescription = story.description || 'Deskripsi tidak tersedia';
    
    // Format tanggal
    const addedDate = story.addedToWishlistAt 
      ? new Date(story.addedToWishlistAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Tanggal tidak tersedia';

    const createdDate = story.createdAt 
      ? new Date(story.createdAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long', 
          day: 'numeric'
        })
      : 'Tanggal tidak tersedia';

    return `
      <div class="story-item" data-story-id="${story.id}">
        <div class="story-item__header">
          <img class="story-item__thumbnail" 
               src="${storyImage}" 
               alt="${storyName}"
               onerror="this.src='${defaultImage}'">
          <div class="story-item__rating">
            <button class="btn-remove-wishlist" data-story-id="${story.id}" title="Hapus dari wishlist">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        </div>
        
        <div class="story-item__content">
          <h3 class="story-item__title">
            <a href="#/detail/${story.id}">${storyName}</a>
          </h3>
          
          <p class="story-item__description">${storyDescription}</p>
          
          <div class="story-item__info">
            <div class="story-item__date">
              <i class="fas fa-calendar"></i>
              <span>Dibuat: ${createdDate}</span>
            </div>
            <div class="story-item__date">
              <i class="fas fa-heart"></i>
              <span>Ditambahkan: ${addedDate}</span>
            </div>
          </div>
          
          ${story.lat && story.lon ? `
            <div class="story-item__location">
              <i class="fas fa-map-marker-alt"></i>
              <span>Lokasi: ${story.lat}, ${story.lon}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  _createEmptyWishlistTemplate() {
    return `
      <div class="empty-wishlist">
        <div class="empty-wishlist__icon">
          <i class="fas fa-heart-broken"></i>
        </div>
        <h3 class="empty-wishlist__title">Wishlist Kosong</h3>
        <p class="empty-wishlist__message">
          Anda belum menambahkan story apapun ke wishlist. 
          Mulai jelajahi story dan tambahkan yang Anda suka!
        </p>
        <a href="#/" class="btn btn-primary">
          <i class="fas fa-home"></i>
          Kembali ke Beranda
        </a>
      </div>
    `;
  }

  _createErrorTemplate(errorMessage) {
    return `
      <div class="error-wishlist">
        <div class="error-wishlist__icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="error-wishlist__title">Terjadi Kesalahan</h3>
        <p class="error-wishlist__message">${errorMessage}</p>
        <button id="retry-load-wishlist" class="btn btn-primary">
          <i class="fas fa-redo"></i>
          Coba Lagi
        </button>
      </div>
    `;
  }

  _initializeEventListeners() {
    // Clear all wishlist button
    const clearAllButton = document.querySelector('#clear-all-wishlist');
    if (clearAllButton) {
      clearAllButton.addEventListener('click', this._handleClearAllWishlist.bind(this));
    }

    // Retry button
    const retryButton = document.querySelector('#retry-load-wishlist');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        this._renderWishlistContent();
      });
    }
  }

  _initializeRemoveButtons() {
    const removeButtons = document.querySelectorAll('.btn-remove-wishlist');
    removeButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const storyId = button.getAttribute('data-story-id');
        await this._handleRemoveFromWishlist(storyId);
      });
    });
  }

  async _handleRemoveFromWishlist(storyId) {
    if (!confirm('Apakah Anda yakin ingin menghapus story ini dari wishlist?')) {
      return;
    }

    try {
      const result = await WishlistDeleteIDB.removeStoryFromWishlist(storyId);
      
      if (result.success) {
        // Show success message
        this._showNotification('Story berhasil dihapus dari wishlist', 'success');
        
        // Refresh wishlist content
        await this._renderWishlistContent();
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      this._showNotification(`Gagal menghapus dari wishlist: ${error.message}`, 'error');
    }
  }

  async _handleClearAllWishlist() {
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA story dari wishlist? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const result = await WishlistDeleteIDB.clearAllWishlist();
      
      if (result.success) {
        this._showNotification('Semua wishlist berhasil dihapus', 'success');
        await this._renderWishlistContent();
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      this._showNotification(`Gagal menghapus wishlist: ${error.message}`, 'error');
    }
  }

  _showNotification(message, type = 'info') {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification__content">
        <span class="notification__message">${message}</span>
        <button class="notification__close">&times;</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('notification--hide');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);

    // Manual close button
    const closeButton = notification.querySelector('.notification__close');
    closeButton.addEventListener('click', () => {
      notification.classList.add('notification--hide');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    });
  }
}