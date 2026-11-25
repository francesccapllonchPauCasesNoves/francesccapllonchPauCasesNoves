function initSlider(totalCards) {
  let currentPage = 0;
  const gap = 24;

  const getCardsPerView = () => {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  };

  let cardsPerView = getCardsPerView();
  let totalPages = Math.ceil(totalCards / cardsPerView);

  function renderDots() {
    dotsContainer.innerHTML = Array.from({ length: totalPages })
      .map(
        (_, index) =>
          `<button class="dot ${index === currentPage ? 'active' : ''}" data-page="${index}" aria-label="Página ${index + 1}"></button>`
      )
      .join('');

    dotsContainer.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => {
        goToPage(Number(dot.dataset.page));
      });
    });
  }

  function goToPage(pageIndex) {
    currentPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
    const scrollAmount = currentPage * (sliderTrack.clientWidth + gap);
    sliderTrack.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    updateActiveDot();
  }

  function updateActiveDot() {
    dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === currentPage);
    });
  }

  prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

  sliderTrack.addEventListener('scroll', () => {
    const newPage = Math.round(
      sliderTrack.scrollLeft / (sliderTrack.clientWidth + gap)
    );
    if (newPage !== currentPage && newPage < totalPages) {
      currentPage = newPage;
      updateActiveDot();
    }
  });

  window.addEventListener('resize', () => {
    const updatedPerView = getCardsPerView();
    if (updatedPerView !== cardsPerView) {
      cardsPerView = updatedPerView;
      totalPages = Math.ceil(totalCards / cardsPerView);
      currentPage = 0;
      renderDots();
      goToPage(0);
    }
  });

  renderDots();
}