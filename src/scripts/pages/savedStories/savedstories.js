import Database from '../../database/database';

export default class savedStoryPage {
    render() {
        return `
            <div>
                <h1>Story Tersimpan</h1>
                <p>Koleksi cerita yang telah Anda simpan</p>
                <div id="saved-stories-content">
                    <p>Memuat story tersimpan...</p>
                </div>
            </div>
        `;
    }

    async afterRender() {
        await this.loadSavedStories();
        this.setupEventListeners();
    }

    async loadSavedStories() {
        const contentContainer = document.getElementById('saved-stories-content');
        
        try {
            const savedStories = await Database.getAllStory();
            console.log("sukses");
            console.log(savedStories);
            
            // Perbaikan: Validasi data yang lebih robust
            if (!savedStories) {
                console.warn('savedStories is null or undefined');
                contentContainer.innerHTML = '<p>Gagal memuat data story</p>';
                return;
            }

            // Pastikan savedStories adalah array
            const storiesArray = Array.isArray(savedStories) ? savedStories : [];
            
            if (storiesArray.length === 0) {
                contentContainer.innerHTML = this.renderEmptyState();
            } else {
                contentContainer.innerHTML = this.renderStoriesList(storiesArray);
            }
        } catch (error) {
            console.error('Error loading saved stories:', error);
            contentContainer.innerHTML = '<p>Gagal memuat data story</p>';
        }
    }

    renderEmptyState() {
        return `
            <div>
                <h3>Belum Ada Story Tersimpan</h3>
                <p>Story yang Anda simpan akan muncul di halaman ini</p>
                <button onclick="window.location.hash = '#/'">Jelajahi Story</button>
            </div>
        `;
    }

    renderStoriesList(stories) {
        const storiesHTML = stories.map(story => {
            // Validasi data story sebelum render
            const safeStory = {
                id: story.id || 'unknown',
                name: story.name || 'Nama tidak tersedia',
                description: story.description || 'Deskripsi tidak tersedia',
                lat: story.lat || null,
                lon: story.lon || null,
                createdAt: story.createdAt || new Date().toISOString()
            };

            return `
                <div class="story-item" data-story-id="${safeStory.id}">
                    <h3>${this.escapeHtml(safeStory.name)}</h3>
                    <p>${this.escapeHtml(safeStory.description)}</p>
                    <p>Lokasi: ${safeStory.lat && safeStory.lon ? `${safeStory.lat}, ${safeStory.lon}` : 'Tidak tersedia'}</p>
                    <p>Tanggal: ${this.formatDate(safeStory.createdAt)}</p>
                    <button class="view-detail-btn" data-story='${this.escapeHtml(JSON.stringify(safeStory))}'>Lihat Detail</button>
                    <button class="delete-story-btn" data-story-id="${safeStory.id}">Hapus</button>
                </div>
            `;
        }).join('');

        return `
            <div class="stories-container">
                <p>${stories.length} story tersimpan</p>
                ${storiesHTML}
            </div>
        `;
    }

    // Method untuk escape HTML characters
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Method untuk format tanggal
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Tanggal tidak valid';
            }
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Tanggal tidak valid';
        }
    }

    // Setup event listeners
    setupEventListeners() {
        const contentContainer = document.getElementById('saved-stories-content');
        if (!contentContainer) return;

        // Event listener untuk tombol "Lihat Detail"
        contentContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-detail-btn')) {
                const storyData = e.target.getAttribute('data-story');
                if (storyData) {
                    try {
                        const story = JSON.parse(storyData);
                        this.viewStoryDetail(story);
                    } catch (error) {
                        console.error('Error parsing story data:', error);
                        alert('Gagal memuat detail story');
                    }
                }
            }
        });

        // Event listener untuk tombol "Hapus"
        contentContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-story-btn')) {
                const storyId = e.target.getAttribute('data-story-id');
                if (storyId) {
                    this.confirmDeleteStory(storyId);
                }
            }
        });
    }

    // Method untuk melihat detail story
    viewStoryDetail(story) {
        // Implementasi sesuai kebutuhan aplikasi Anda
        console.log('Viewing story detail:', story);
        // Misalnya redirect ke halaman detail
        window.location.hash = `#/story/${story.id}`;
    }

    // Method untuk konfirmasi hapus story
    async confirmDeleteStory(storyId) {
        if (confirm('Apakah Anda yakin ingin menghapus story ini?')) {
            try {
                await Database.removeStory(storyId);
                // Reload halaman setelah berhasil hapus
                await this.loadSavedStories();
                alert('Story berhasil dihapus');
            } catch (error) {
                console.error('Error deleting story:', error);
                alert('Gagal menghapus story');
            }
        }
    }
}