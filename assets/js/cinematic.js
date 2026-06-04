document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.cinematic-block');
    const stickyImage = document.getElementById('cinematicImage');
    
    if (!blocks.length || !stickyImage) return;

    // Use a very forgiving intersection observer for desktop mode on small screens
    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -10% 0px',
        threshold: 0
    };

    let imageFadeTimeout = null;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all
                blocks.forEach(b => b.classList.remove('active'));
                
                // Add active to current
                const block = entry.target;
                block.classList.add('active');
                
                // Update Sticky Image with a crossfade effect
                const newSrc = block.getAttribute('data-image');
                if (newSrc && stickyImage.getAttribute('src') !== newSrc) {
                    stickyImage.style.opacity = 0;
                    // Clear any pending crossfade to prevent race conditions
                    if (imageFadeTimeout) clearTimeout(imageFadeTimeout);
                    imageFadeTimeout = setTimeout(() => {
                        stickyImage.setAttribute('src', newSrc);
                        stickyImage.style.opacity = 1;
                        imageFadeTimeout = null;
                    }, 300);
                }
            }
        });
    }, observerOptions);

    blocks.forEach(block => observer.observe(block));
    
    // Set initial image and make first block active
    if (blocks[0]) {
        blocks[0].classList.add('active');
        const src = blocks[0].getAttribute('data-image');
        if (src) stickyImage.setAttribute('src', src);
    }
    
    // Fallback: If scrolling is weird on some mobile desktop views, ensure at least one is active on scroll
    window.addEventListener('scroll', () => {
        let anyActive = false;
        blocks.forEach(b => {
            if (b.classList.contains('active')) anyActive = true;
        });
        if (!anyActive && blocks[0]) blocks[0].classList.add('active');
    }, { passive: true });
});
