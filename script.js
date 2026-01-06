// Portfolio Scripts

document.addEventListener('DOMContentLoaded', () => {

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                const hamburger = document.querySelector('.hamburger');
                if (mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    hamburger.classList.remove('active'); // Optional: Add active state to hamburger for visual feedback
                }

                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active Link Scroll Spy
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Trigger when near the top (navbar area), more reliable than height-based
            if (window.scrollY >= (sectionTop - 120)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(a => {
            a.classList.remove('active');
            // Check if href string matches the ID
            if (a.getAttribute('href').includes(current) && current !== '') {
                a.classList.add('active');
            }
        });
    });

    // Scroll Reveal Animation (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(element => {
        observer.observe(element);
    });

    // Mobile Hamburger Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            hamburger.classList.toggle('active'); // You can add CSS for hamburger animation
        });
    }

    // --- AUTO-DISCOVERY AND MANUAL GALLERY LOGIC ---

    // 1. Manual List: Known files with complex names
    const manualImages = [
        "Branding-1-atmos.jpg", // Branding 1 (Special Name)
        "logo-3 .jpeg",         // Logo 3 (Has space)
        "poster-14-left-side.jpeg.jpeg",
        "poster-14-right-side.jpeg"
    ];

    // Track loaded images to prevent duplicates
    const loadedImages = new Set();
    manualImages.forEach(img => loadedImages.add(img.toLowerCase().trim()));

    const galleryGrid = document.querySelector('.gallery-grid');

    // Function to add item to DOM
    const addItemToGallery = (filename, category, title, label) => {
        if (!galleryGrid) return;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item reveal';
        itemDiv.setAttribute('data-category', category);

        itemDiv.innerHTML = `
            <img src="${filename}" alt="${title}">
            <div class="gallery-overlay">
                <div class="overlay-content">
                    <h3>${title}</h3>
                    <p>${label}</p>
                </div>
            </div>
        `;

        galleryGrid.appendChild(itemDiv);
        // If observer is reachable
        observer.observe(itemDiv);
    };

    // 2. Load Manual Images
    const loadManualGallery = () => {
        if (!galleryGrid) return;
        galleryGrid.innerHTML = ''; // Clear existing

        manualImages.forEach(filename => {
            let category = '', title = '', label = '';
            const lowerName = filename.toLowerCase();

            if (lowerName.startsWith('branding')) {
                category = 'branding'; title = 'Branding Project'; label = 'Branding';
            } else if (lowerName.startsWith('logo')) {
                category = 'logos'; title = 'Logo Design'; label = 'Logos';
            } else if (lowerName.startsWith('poster')) {
                category = 'posters'; title = 'Creative Poster'; label = 'Posters';
            } else if (lowerName.startsWith('package')) {
                category = 'packaging'; title = 'Packaging Design'; label = 'Packaging';
            } else if (lowerName.startsWith('photo') || lowerName.startsWith('photo-editing')) {
                category = 'manipulation'; title = 'Photo Editing'; label = 'Image Edit';
            } else if (lowerName.startsWith('illustrator')) {
                category = 'illustration'; title = 'Digital Illustration'; label = 'Illustration';
            } else {
                return;
            }
            addItemToGallery(filename, category, title, label);
        });
    };

    // 3. Auto-Discovery System (Checks for logo-1...20, branding-1...20, etc.)
    const checkAndLoadImage = (filename, category, title, label) => {
        // Skip if already in manual list
        if (loadedImages.has(filename.toLowerCase().trim())) return;

        const img = new Image();
        img.onload = () => {
            // Check again in case of race condition
            if (!loadedImages.has(filename.toLowerCase().trim())) {
                loadedImages.add(filename.toLowerCase().trim());
                addItemToGallery(filename, category, title, label);

                // Re-apply filter if needed
                const activeBtn = document.querySelector('.filter-btn.active');
                if (activeBtn && activeBtn.getAttribute('data-filter') !== 'all' && activeBtn.getAttribute('data-filter') !== category) {
                    const newItem = galleryGrid.lastElementChild;
                    if (newItem) newItem.style.display = 'none';
                }
            }
        };
        img.src = filename;
    };

    const autoDiscoverImages = () => {
        const categories = [
            { prefix: 'branding', cat: 'branding', title: 'Startups Branding', label: 'Branding' },
            { prefix: 'logo', cat: 'logos', title: 'Brand Logo', label: 'Logos' },
            { prefix: 'poster', cat: 'posters', title: 'Creative Poster', label: 'Posters' },
            { prefix: 'package', cat: 'packaging', title: 'Product Package', label: 'Packaging' },
            { prefix: 'photo-editing', cat: 'manipulation', title: 'Photo Editing', label: 'Image Edit' },
            { prefix: 'photo', cat: 'manipulation', title: 'Photo Editing', label: 'Image Edit' },
            { prefix: 'illustrator', cat: 'illustration', title: 'Digital Art', label: 'Illustration' }
        ];

        // Check common formats: name-N.jpg, name-N.jpeg, name N.jpg...
        // Checking numbers 1 to 20
        for (let i = 1; i <= 20; i++) {
            categories.forEach(c => {
                checkAndLoadImage(`${c.prefix}-${i}.jpg`, c.cat, c.title, c.label);
                checkAndLoadImage(`${c.prefix}-${i}.jpeg`, c.cat, c.title, c.label);
                checkAndLoadImage(`${c.prefix} ${i}.jpg`, c.cat, c.title, c.label);
                checkAndLoadImage(`${c.prefix} ${i}.jpeg`, c.cat, c.title, c.label);
            });
        }
    };

    // Run Loaders
    // loadManualGallery happens first, but async autoDiscover might finish anytime.
    // Order of calling doesn't strictly guarantee order in DOM due to network, 
    // but Manual items are added synchronously so they appear first if ready.
    loadManualGallery();
    autoDiscoverImages();

    // --- END AUTO-DISCOVERY ---

    // Portfolio Gallery Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    // Re-select items now that they are in the DOM
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Helper to randomize visual order using CSS Grid 'order' property
    const randomizeOrder = () => {
        // Need to re-select inside the function in case called dynamically (though keeping global ref is fine for now)
        const currentItems = document.querySelectorAll('.gallery-item');
        currentItems.forEach(item => {
            item.style.order = Math.floor(Math.random() * 1000);
        });
    };

    // Helper to reset visual order to default DOM order
    const resetOrder = () => {
        const currentItems = document.querySelectorAll('.gallery-item');
        currentItems.forEach(item => {
            item.style.order = 0;
        });
    };

    // Initialize 'All' view with random order on load
    randomizeOrder();

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            // Apply Random vs Ordered logic
            if (filterValue === 'all') {
                randomizeOrder();
            } else {
                resetOrder();
            }

            const currentItems = document.querySelectorAll('.gallery-item');
            currentItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Re-trigger animation
                    item.classList.remove('active');
                    void item.offsetWidth; // Trigger reflow
                    item.classList.add('active');
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Lightbox Functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const closeLightbox = document.querySelector('.close-lightbox');

    // Using Event Delegation for dynamically added items
    const galleryGridContainer = document.querySelector('.gallery-grid');
    if (galleryGridContainer) {
        galleryGridContainer.addEventListener('click', (e) => {
            // Find closest gallery-item ancestor
            const item = e.target.closest('.gallery-item');
            if (item) {
                const img = item.querySelector('img');
                if (img) {
                    lightbox.classList.add('show');
                    lightboxImg.src = img.src;
                    captionText.innerHTML = item.querySelector('h3').innerText;
                }
            }
        });
    }

    if (closeLightbox) {
        closeLightbox.addEventListener('click', () => {
            lightbox.classList.remove('show');
        });
    }

    // Close lightbox when clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('show');
            }
        });
    }

    // WhatsApp Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Format the WhatsApp message
            const phoneNumber = '917994279821'; // User's phone number
            const whatsappMessage = `Hello, I'm ${name}.%0A%0AEmail: ${email}%0A%0AMessage:%0A${message}`;
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;

            // Button Feedback
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = 'Opening WhatsApp...';
            btn.style.backgroundColor = '#25D366'; // WhatsApp Color
            btn.style.borderColor = '#25D366';
            btn.style.color = '#fff';

            // Open WhatsApp in a new tab after a brief delay
            setTimeout(() => {
                window.open(whatsappURL, '_blank');

                // Reset form and button
                contactForm.reset();
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 1000);
        });
    }

});
