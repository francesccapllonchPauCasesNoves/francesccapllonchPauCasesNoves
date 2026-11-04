document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const preloaderText = document.getElementById('preloader-text');

  if (preloader) {
    if (preloaderText) {
      setTimeout(() => {
        preloaderText.classList.add('animate-text-reveal');
      }, 200);
    }

    setTimeout(() => {
      preloader.classList.add('preloader-hidden');
      document.body.classList.remove('no-scroll');

      setTimeout(() => {
        preloader.style.display = 'none';
      }, 700);
    }, 1800);
  }
});
