document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.cinematic-block');
    const stickyImage = document.getElementById('cinematicImage');
    
    if (!blocks.length || !stickyImage) return;

    // Intersection Observer to trigger active states
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -40% 0px',
        threshold: 0
    };

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
                    setTimeout(() => {
                        stickyImage.setAttribute('src', newSrc);
                        stickyImage.style.opacity = 1;
                    }, 300);
                }
            }
        });
    }, observerOptions);

    blocks.forEach(block => observer.observe(block));
    
    // Set initial image
    if (blocks[0]) {
        blocks[0].classList.add('active');
        const src = blocks[0].getAttribute('data-image');
        if (src) stickyImage.setAttribute('src', src);
    }
});
