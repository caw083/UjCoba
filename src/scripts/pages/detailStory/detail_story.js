
import { getStoryData } from "../home/api_data/story_data";
import "./detail_story.css";

export default class DetailStory {
  constructor(storyId) {
    this.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLWJyWXdJZ2o3TG9uaEdmMDUiLCJpYXQiOjE3NTgxMDA1NDZ9.PhJAYot_sLL2KxJbVIQXYC5X4_gP0u1HZgAjyhj--j4";
    this.storyId = storyId || "story-GRKdEV5AOc_Jfmkc";
    this.story = null;
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

  getLocationName(lat, lon) {
    // Simple location mapping - you can enhance this with reverse geocoding
    const locations = {
      "-6.159584868087155,106.77204608917238": "Jakarta",
      "-3.3098589,114.6905436": "Kalimantan Tengah",
      "-6.376200834871442,107.01258551912814": "Bandung",
      "-6.222899782339617,106.74591064453126": "Jakarta Selatan"
    };
    
    const key = `${lat},${lon}`;
    return locations[key] || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }

  async findStoryById(storyId) {
    try {
      const data = await getStoryData(this.token);
      if (!data || !data.listStory) return null;
      
      return data.listStory.find(story => story.id === storyId);
    } catch (error) {
      console.error('Error finding story:', error);
      return null;
    }
  }

  createBackButton() {
    return `
      <button class="back-button" onclick="history.back()">
        <span class="back-arrow">←</span>
        <span>Kembali</span>
      </button>
    `;
  }

  createStoryDetail(story) {
    return `
      <div class="story-detail">
        <div class="story-hero">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-image">
          <div class="story-overlay">
            <div class="story-header">
              <h1 class="story-title">${story.name}</h1>
              <div class="story-location">
                <span class="location-icon">📍</span>
                <span class="location-text">${this.getLocationName(story.lat, story.lon)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="story-content">
          <div class="story-meta">
            <div class="meta-item">
              <span class="meta-icon">🕒</span>
              <span class="meta-text">${this.formatDate(story.createdAt)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">👤</span>
              <span class="meta-text">Oleh ${story.name}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">🌍</span>
              <span class="meta-text">Lat: ${story.lat.toFixed(6)}, Lon: ${story.lon.toFixed(6)}</span>
            </div>
          </div>
          
          <div class="story-description">
            <h2 class="section-title">Cerita</h2>
            <div class="description-content">
              ${this.formatDescription(story.description)}
            </div>
          </div>
          
          <div class="story-actions">
            <button class="action-button primary" onclick="navigator.share({title: '${story.name}', text: '${story.description}', url: window.location.href})">
              <span class="action-icon">📤</span>
              <span>Bagikan</span>
            </button>
            <button class="action-button secondary" onclick="window.open('https://maps.google.com/?q=${story.lat},${story.lon}', '_blank')">
              <span class="action-icon">🗺️</span>
              <span>Lihat di Maps</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  formatDescription(description) {
    // Format description with paragraphs
    return description
      .split('\n')
      .filter(p => p.trim() !== '')
      .map(paragraph => `<p>${paragraph.trim()}</p>`)
      .join('');
  }

  createLoadingState() {
    return `
      <div class="story-detail-loading">
        <div class="loading-spinner"></div>
        <p>Memuat cerita...</p>
      </div>
    `;
  }

  createErrorState(message) {
    return `
      <div class="story-detail-error">
        <div class="error-icon">😕</div>
        <h3>Cerita Tidak Ditemukan</h3>
        <p>${message}</p>
        ${this.createBackButton()}
      </div>
    `;
  }

  async render() {
    try {
      // Show loading state first
      const loadingHtml = `
        <section class="story-detail-container">
          ${this.createBackButton()}
          ${this.createLoadingState()}
        </section>
      `;
      
      // Find the specific story
      this.story = await this.findStoryById(this.storyId);
      
      if (!this.story) {
        return `
          <section class="story-detail-container">
            ${this.createBackButton()}
            ${this.createErrorState('Cerita dengan ID tersebut tidak ditemukan.')}
          </section>
        `;
      }

      return `
        <section class="story-detail-container">
          ${this.createBackButton()}
          ${this.createStoryDetail(this.story)}
        </section>
      `;
      
    } catch (error) {
      console.error('Error rendering story detail:', error);
      return `
        <section class="story-detail-container">
          ${this.createBackButton()}
          ${this.createErrorState(`Terjadi kesalahan: ${error.message}`)}
        </section>
      `;
    }
  }

  async afterRender() {
    // Add image lazy loading
    const storyImage = document.querySelector('.story-image');
    if (storyImage) {
      storyImage.addEventListener('load', () => {
        storyImage.classList.add('loaded');
      });
    }

    // Add scroll effects
    this.addScrollEffects();
    
    // Add share functionality fallback
    this.setupShareFallback();
  }

  addScrollEffects() {
    const storyHero = document.querySelector('.story-hero');
    if (storyHero) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        storyHero.style.transform = `translateY(${rate}px)`;
      });
    }
  }

  setupShareFallback() {
    const shareButtons = document.querySelectorAll('.action-button.primary');
    shareButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (navigator.share && this.story) {
          try {
            await navigator.share({
              title: this.story.name,
              text: this.story.description,
              url: window.location.href
            });
          } catch (error) {
            console.log('Sharing cancelled or failed');
            this.fallbackShare();
          }
        } else {
          this.fallbackShare();
        }
      });
    });
  }

  fallbackShare() {
    if (this.story) {
      const shareText = `${this.story.name}\n\n${this.story.description}\n\n${window.location.href}`;
      navigator.clipboard.writeText(shareText).then(() => {
        this.showToast('Link berhasil disalin ke clipboard!');
      }).catch(() => {
        this.showToast('Tidak dapat menyalin link');
      });
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 1000;
      animation: fadeInOut 3s forwards;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}