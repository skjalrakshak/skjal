// Reset scroll position on page load to prevent GSAP/Lenis from getting stuck
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
