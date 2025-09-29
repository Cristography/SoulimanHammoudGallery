document.addEventListener('DOMContentLoaded', function () {
    // --- Gallery and Modal State ---
    let galleryData = [];
    let currentIndex = 0;

    // --- DOM Elements ---
    const galleryContainer = document.getElementById('galleryContainer');
    const artModal = document.getElementById('artModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mobileNav = document.getElementById('mobile-nav');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const languageToggle = document.getElementById('language-toggle');
    const prevArtBtn = document.getElementById('prevArt');
    const nextArtBtn = document.getElementById('nextArt');

    let translations = {};
    let currentLanguage = localStorage.getItem('language') || 'en';

    // --- Language and Translation ---
    async function loadTranslations() {
        try {
            const response = await fetch('translation.json');
            translations = await response.json();
            setLanguage(currentLanguage);
        } catch (error) { console.error('Could not load translations:', error); }
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translations[key] && translations[key][lang]) {
                el.textContent = translations[key][lang];
            }
        });
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        languageToggle.textContent = lang === 'en' ? 'AR' : 'EN';
    }
    languageToggle.addEventListener('click', () => setLanguage(currentLanguage === 'en' ? 'ar' : 'en'));

    // --- Dark Mode ---
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        darkModeToggle.checked = theme === 'dark';
    }
    darkModeToggle.addEventListener('change', () => {
        const theme = darkModeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    });
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    // --- Header & Mobile Menu ---
    window.addEventListener('scroll', () => document.body.classList.toggle('scrolled', window.scrollY > 50));
    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- Gallery Loading ---
    async function loadGallery() {
        try {
            const response = await fetch('gallery.json');
            if (!response.ok) throw new Error('Gallery data not found.');
            galleryData = await response.json();

            const masonryGallery = document.createElement('div');
            masonryGallery.className = 'masonry-gallery';

            galleryData.forEach((art, index) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `<img src="${art.image_thumb}" alt="${art.title}" loading="lazy"><div class="gallery-info"><h3>${art.title}</h3></div>`;
                galleryItem.addEventListener('click', () => openModal(index));
                masonryGallery.appendChild(galleryItem);
            });

            galleryContainer.innerHTML = '';
            galleryContainer.appendChild(masonryGallery);
        } catch (error) {
            console.error('Error loading gallery:', error);
            galleryContainer.innerHTML = '<p style="text-align:center;">Failed to load gallery.</p>';
        }
    }

    // --- Modal Functionality ---
    function updateModalContent(index) {
        const art = galleryData[index];
        modalImage.src = art.image_full;
        modalImage.alt = art.title;
        modalTitle.textContent = art.title;
        modalDescription.textContent = art.description;
        currentIndex = index;
    }

    function openModal(index) {
        updateModalContent(index);
        artModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        artModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function showNextArt() {
        const nextIndex = (currentIndex + 1) % galleryData.length;
        updateModalContent(nextIndex);
    }

    function showPrevArt() {
        const prevIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
        updateModalContent(prevIndex);
    }

    closeModalBtn.addEventListener('click', closeModal);
    nextArtBtn.addEventListener('click', showNextArt);
    prevArtBtn.addEventListener('click', showPrevArt);
    window.addEventListener('click', (e) => { if (e.target === artModal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (artModal.style.display === 'block') {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') showNextArt();
            if (e.key === 'ArrowLeft') showPrevArt();
        }
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Initialize
    loadTranslations();
    loadGallery();
});