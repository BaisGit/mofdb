// MOF DB - Shared JavaScript file

let mofdbBasePath = './';

function detectBasePath() {
    return window.location.pathname.includes('/pages/') ? '../' : './';
}

async function loadPartial(container, path) {
    if (!container) return;
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}`);
        }
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.error(error);
    }
}

function updateRootRelativeLinks(container) {
    if (!container) return;
    container.querySelectorAll('[data-root-href]').forEach(link => {
        const relative = link.getAttribute('data-root-href');
        if (!relative) return;

        if (relative === 'index.html') {
            link.setAttribute('href', mofdbBasePath);
            return;
        }

        if (relative.startsWith('index.html#')) {
            const anchor = relative.split('#')[1] || '';
            const anchorPart = anchor ? `#${anchor}` : '';
            link.setAttribute('href', `${mofdbBasePath}${anchorPart}`);
            return;
        }

        link.setAttribute('href', mofdbBasePath + relative);
    });
    container.querySelectorAll('[data-root-src]').forEach(img => {
        const relative = img.getAttribute('data-root-src');
        if (relative) {
            img.setAttribute('src', mofdbBasePath + relative);
        }
    });
}

async function loadSharedPartials() {
    mofdbBasePath = detectBasePath();
    const headerContainer = document.querySelector('[data-include="header"]');
    const footerContainer = document.querySelector('[data-include="footer"]');
    const partialPrefix = window.location.pathname.includes('/pages/') ? '' : 'pages/';

    await Promise.all([
        loadPartial(headerContainer, `${partialPrefix}header.html`),
        loadPartial(footerContainer, `${partialPrefix}footer.html`)
    ]);

    updateRootRelativeLinks(headerContainer);
    updateRootRelativeLinks(footerContainer);
    
    // Initialize dropdowns after header is loaded
    if (headerContainer) {
        initMobileDropdowns();
    }
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.dataset-card, .doc-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(el);
    });
}

function initCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const targetId = button.dataset.target;
            const codeBlock = document.getElementById(targetId);
            if (!codeBlock) return;

            const codeText = codeBlock.innerText.trim();

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(codeText);
                } else {
                    const textarea = document.createElement('textarea');
                    textarea.value = codeText;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                }

                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            } catch (error) {
                console.error('Copy failed', error);
                button.textContent = 'Error';
                setTimeout(() => {
                    button.textContent = 'Copy';
                }, 2000);
            }
        });
    });
}

function initMobileDropdowns() {
    const isMobile = window.innerWidth <= 768;
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;

        if (isMobile) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const isActive = dropdown.classList.contains('active');
                
                // Close all other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active', !isActive);
            });
        } else {
            // On desktop, prevent default on toggle click to allow hover
            toggle.addEventListener('click', function(e) {
                const href = toggle.getAttribute('data-root-href');
                if (href && href.includes('#')) {
                    // Allow anchor links to work
                    return;
                }
                e.preventDefault();
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (isMobile && !e.target.closest('.nav-dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadSharedPartials();
    initSmoothScroll();
    initScrollAnimations();
    initCopyButtons();
    initMobileDropdowns();
    
    // Re-initialize dropdowns after a short delay to ensure header is fully loaded
    setTimeout(() => {
        initMobileDropdowns();
    }, 100);
    
    // Re-initialize on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initMobileDropdowns();
        }, 250);
    });
});