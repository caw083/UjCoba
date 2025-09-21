// StoryModal.js
import { getCityofGeocode } from "../api_data/reverseGeocoding";

export default class StoryModal {
  constructor() {
    this.currentModal = null;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async getLocationName(lat, lon) {
    if (lat == null || lon == null || typeof lat !== 'number' || typeof lon !== 'number') {
      return "Unknown Location";
    }    
    try {
      const cityName = await getCityofGeocode(lon, lat); // lon, lat (longitude dulu)
      return cityName;
    } catch (error) {
      console.error('Error getting location:', error);
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  }

  async show(story, mapInstance = null) {
    // Close existing modal if any
    this.close();

    // Get location name untuk modal
    let locationName = 'Loading location...';
    if (story.lat && story.lon) {
      try {
        locationName = await this.getLocationName(story.lat, story.lon);
      } catch (error) {
        locationName = `${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}`;
      }
    }

    // Create modal with CSS classes
    const modal = document.createElement('div');
    modal.className = 'story-modal-overlay';
    
    modal.innerHTML = `
      <div class="story-modal-content">
        <div class="story-modal-image-container">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-modal-image">
          <button class="story-modal-close-btn" type="button">×</button>
        </div>
        <div class="story-modal-body">
          <h2 class="story-modal-title">${story.name}</h2>
          <p class="story-modal-description">${story.description}</p>
          <div class="story-modal-divider">
            <div class="story-modal-meta">
              <span class="story-modal-meta-icon">📍</span>
              <span>${locationName}</span>
            </div>
            <div class="story-modal-meta">
              <span class="story-modal-meta-icon">🕒</span>
              <span>${this.formatDate(story.createdAt)}</span>
            </div>
            ${story.lat && story.lon && mapInstance ? `
              <div class="story-modal-actions">
                <button class="story-modal-btn story-modal-btn--primary" data-action="show-on-map" type="button">
                  Show on Map
                </button>
                <button class="story-modal-btn story-modal-btn--success" data-action="satellite-view" type="button">
                  Satellite View
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    // Store reference to current modal
    this.currentModal = modal;
    
    // Add event listeners
    this.setupEventListeners(modal, story, mapInstance);
    
    // Add to DOM
    document.body.appendChild(modal);

    // Add fade-in animation
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
    });

    return modal;
  }

  setupEventListeners(modal, story, mapInstance) {
    // Close button
    const closeBtn = modal.querySelector('.story-modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Close when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Action buttons
    const showOnMapBtn = modal.querySelector('[data-action="show-on-map"]');
    const satelliteBtn = modal.querySelector('[data-action="satellite-view"]');

    if (showOnMapBtn && mapInstance) {
      showOnMapBtn.addEventListener('click', () => {
        this.focusOnStory(story, mapInstance);
        this.close();
      });
    }

    if (satelliteBtn && mapInstance) {
      satelliteBtn.addEventListener('click', () => {
        mapInstance.switchToLayer('Satellite');
        this.focusOnStory(story, mapInstance);
        this.close();
      });
    }

    // Escape key handler
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        this.close();
        document.removeEventListener('keydown', handleEscapeKey);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);

    // Store the escape handler for cleanup
    this.currentEscapeHandler = handleEscapeKey;
  }

  focusOnStory(story, mapInstance) {
    if (mapInstance && story.lat && story.lon) {
      mapInstance.changeCamera([story.lat, story.lon], 12);
    }
  }

  close() {
    if (this.currentModal) {
      // Add fade-out animation
      this.currentModal.style.opacity = '0';
      
      // Remove after animation
      setTimeout(() => {
        if (this.currentModal && this.currentModal.parentNode) {
          this.currentModal.parentNode.removeChild(this.currentModal);
        }
        this.currentModal = null;
      }, 300);

      // Clean up escape key listener
      if (this.currentEscapeHandler) {
        document.removeEventListener('keydown', this.currentEscapeHandler);
        this.currentEscapeHandler = null;
      }
    }
  }

  // Static method untuk quick access
  static async showStory(story, mapInstance = null) {
    const modal = new StoryModal();
    return await modal.show(story, mapInstance);
  }
}