import { getStoryData } from "../about/story_data";
import "./card.css";

export default class HomePage {
  constructor() {
    this.data = null;
    this.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLWJyWXdJZ2o3TG9uaEdmMDUiLCJpYXQiOjE3NTgxMDA1NDZ9.PhJAYot_sLL2KxJbVIQXYC5X4_gP0u1HZgAjyhj--j4"
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
    if (lat === -6.159584868087155 && lon === 106.77204608917238) return "Jakarta";
    if (lat === -3.3098589 && lon === 114.6905436) return "Kalimantan Tengah";
    if (lat === -6.376200834871442 && lon === 107.01258551912814) return "Bandung";
    if (lat === -6.222899782339617 && lon === 106.74591064453126) return "Jakarta Selatan";
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }

  createStoryCard(story) {
    return `
      <div class="story-card">
        <div class="card-image">
          <img src="${story.photoUrl}" alt="${story.name}" loading="lazy">
          <div class="card-overlay">
            <span class="location">📍 ${this.getLocationName(story.lat, story.lon)}</span>
          </div>
        </div>
        <div class="card-content">
          <h3 class="card-title">${story.name}</h3>
          <p class="card-description">${story.description}</p>
          <div class="card-meta">
            <span class="card-date">🕒 ${this.formatDate(story.createdAt)}</span>
          </div>
        </div>
      </div>
    `;
  }



  async render() {
    try {
      this.data = await getStoryData(this.token);
      console.log('Data retrieved:', this.data);
      
      if (!this.data || !this.data.listStory || this.data.listStory.length === 0) {
        return `
          
          <section class="stories-container">
            <div class="page-header">
              <h1 class="page-title">Stories</h1>
              <p class="page-subtitle">No stories available</p>
            </div>
          </section>
        `;
      }

      const stories = this.data.listStory;
      const storyCards = stories.map(story => this.createStoryCard(story)).join('');

      return `
        <section class="stories-container">
          <div class="page-header">
            <h1 class="page-title">Stories</h1>
            <p class="page-subtitle">Discover amazing stories from our community</p>
          </div>
          
          <div class="stats-bar">
            <div class="stat-item">
              <span class="stat-number">${stories.length}</span>
              <span class="stat-label">Total Stories</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${new Set(stories.map(s => s.name)).size}</span>
              <span class="stat-label">Contributors</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${new Set(stories.map(s => this.getLocationName(s.lat, s.lon))).size}</span>
              <span class="stat-label">Locations</span>
            </div>
          </div>

          <div class="stories-grid">
            ${storyCards}
          </div>
        </section>
      `;
    } catch (error) {
      console.error('Error fetching data:', error);
      return `
        <section class="stories-container">
          <div class="page-header">
            <h1 class="page-title">Stories</h1>
          </div>
          <div class="error">
            <h3>Error Loading Stories</h3>
            <p>${error.message}</p>
          </div>
        </section>
      `;
    }
  }

  async afterRender() {
    // Add click handlers for story cards
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (this.data && this.data.listStory && this.data.listStory[index]) {
          const story = this.data.listStory[index];
          this.showStoryDetail(story);
        }
      });
    });
  }

  showStoryDetail(story) {
    // Create modal or navigate to detail page
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
      ">
        <div style="position: relative;">
          <img src="${story.photoUrl}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px 12px 0 0;">
          <button onclick="this.closest('.modal').remove()" style="
            position: absolute;
            top: 16px;
            right: 16px;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font-size: 16px;
          ">×</button>
        </div>
        <div style="padding: 24px;">
          <h2 style="margin: 0 0 8px 0; color: #333;">${story.name}</h2>
          <p style="color: #666; margin: 0 0 16px 0;">${story.description}</p>
          <div style="border-top: 1px solid #eee; padding-top: 16px;">
            <p style="margin: 8px 0; color: #888; font-size: 14px;">
              📍 ${this.getLocationName(story.lat, story.lon)}
            </p>
            <p style="margin: 8px 0; color: #888; font-size: 14px;">
              🕒 ${this.formatDate(story.createdAt)}
            </p>
          </div>
        </div>
      </div>
    `;
    
    modal.className = 'modal';
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
  }
}