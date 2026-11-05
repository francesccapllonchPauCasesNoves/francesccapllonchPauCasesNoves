document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');

  if (header) {
    let lastScrollY = window.scrollY;

    // Inicializar estado del navbar
    header.classList.add('nav-visible');

    // Control de scroll: ocultar al bajar, mostrar al subir
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        // En la parte superior de la página siempre visible
        header.classList.remove('nav-hidden');
        header.classList.add('nav-visible');
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scroll hacia abajo -> ocultar barra de navegación
        header.classList.remove('nav-visible');
        header.classList.add('nav-hidden');
      } else if (currentScrollY < lastScrollY) {
        // Scroll hacia arriba -> mostrar barra de navegación
        header.classList.remove('nav-hidden');
        header.classList.add('nav-visible');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });

    // Detección de proximidad del cursor al borde superior (clientY <= 50px)
    window.addEventListener('mousemove', (e) => {
      if (e.clientY <= 50) {
        header.classList.remove('nav-hidden');
        header.classList.add('nav-visible');
      }
    });
  }

  // Manejo del formulario de contacto
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.form-submit-btn');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.innerHTML = '<span>✓ Missatge enviat correctament!</span>';
        submitBtn.style.background = '#CFC7B8';
        submitBtn.style.color = '#2C2825';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        contactForm.reset();
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }
      }, 3500);
    });
  }

  // Garantía de cierre y transición del preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Permitir clic para saltar inmediatamente si el usuario no quiere esperar
    preloader.addEventListener('click', () => {
      preloader.classList.add('preloader-hidden');
      preloader.style.display = 'none';
      document.body.classList.remove('no-scroll');
    });

    // Cierre automático tras la animación
    setTimeout(() => {
      preloader.classList.add('preloader-hidden');
      document.body.classList.remove('no-scroll');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 700);
    }, 1800);
  }
});

const track = document.querySelector('.slider');

window.addEventListener('load', () => {
  // Buscamos la animación del carrusel por su nombre en CSS (@keyframes scroll)
  const anim = document.getAnimations().find(
    a => a.animationName === 'scroll'
  );

  if (!anim) {
    console.warn("No se encontró la animación 'scroll'. Revisa el nombre en tu CSS.");
    return;
  }

  let animFrameId;

  // Desaceleración progresiva (freno suave)
  track.addEventListener('mouseenter', () => {
    cancelAnimationFrame(animFrameId);

    const slowDown = () => {
      if (anim.playbackRate > 0.005) {
        anim.playbackRate *= 0.985;
        animFrameId = requestAnimationFrame(slowDown);
      } else {
        anim.playbackRate = 0;
      }
    };

    slowDown();
  });

  // Aceleración progresiva (arranque suave)
  track.addEventListener('mouseleave', () => {
    cancelAnimationFrame(animFrameId);

    const speedUp = () => {
      if (anim.playbackRate < 0.995) {
        anim.playbackRate += (1 - anim.playbackRate) * 0.015;
        animFrameId = requestAnimationFrame(speedUp);
      } else {
        anim.playbackRate = 1;
      }
    };

    speedUp();
  });
});

function setLanguage(lang) {
  if (!translations[lang]) lang = 'en';

  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const text = translations[lang][el.dataset.i18n];
    if (text !== undefined) el.innerHTML = text;
  });

  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang);
  });

  localStorage.setItem('lang', lang);
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('lang');
  const browser = navigator.language.slice(0, 2);
  setLanguage(saved || browser);

  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
});

