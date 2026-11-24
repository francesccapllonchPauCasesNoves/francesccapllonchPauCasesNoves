document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');

  let isNavigating = false;
  let navigationTimeout;

  // Funciones para control del menú móvil
  const closeMobileMenu = () => {
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
      if (mobileMenuBtn) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
      if (hamburgerIcon && closeIcon) {
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      }
    }
  };

  const toggleMobileMenu = () => {
    if (!mobileMenu) return;
    const isClosed = mobileMenu.classList.contains('hidden');
    if (isClosed) {
      mobileMenu.classList.remove('hidden');
      if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
      if (hamburgerIcon && closeIcon) {
        hamburgerIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
      }
    } else {
      closeMobileMenu();
    }
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // Cerrar menú móvil al hacer clic fuera del header
  document.addEventListener('click', (e) => {
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      if (header && !header.contains(e.target)) {
        closeMobileMenu();
      }
    }
  });

  // Interceptar todos los enlaces ancla (#...) para navegación fluida, auto-cierre y encuadre
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();

          // Cerrar menú móvil inmediatamente si estaba abierto
          closeMobileMenu();

          // Mantener visible la barra de navegación durante la navegación
          if (header) {
            header.classList.remove('nav-hidden');
            header.classList.add('nav-visible');
          }

          // Evitar ocultamiento por scroll durante la animación
          isNavigating = true;
          clearTimeout(navigationTimeout);
          navigationTimeout = setTimeout(() => {
            isNavigating = false;
          }, 850);

          // Scroll suave respetando el scroll-margin-top configurado
          targetElement.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, '', targetId);
        }
      }
    });
  });

  if (header) {
    let lastScrollY = window.scrollY;

    // Inicializar estado del navbar
    header.classList.add('nav-visible');

    // Control de scroll: ocultar al bajar, mostrar al subir
    window.addEventListener('scroll', () => {
      if (isNavigating) return;

      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        // En la parte superior de la página siempre visible
        header.classList.remove('nav-hidden');
        header.classList.add('nav-visible');
      } else if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scroll hacia abajo -> ocultar barra de navegación
        header.classList.remove('nav-visible');
        header.classList.add('nav-hidden');
        closeMobileMenu();
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

  // Manejo del formulario de contacto amb Formspree (fetch asíncron + validació HTML5)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // HTML5 constraint validation
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const submitBtn   = document.getElementById('contact-submit');
      const statusEl    = document.getElementById('contact-status');
      const originalHTML = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Enviant…</span>';
      }

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method:  'POST',
          body:    formData,
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          contactForm.reset();
          if (statusEl) {
            statusEl.textContent = '✓ Missatge enviat correctament!';
            statusEl.className   = 'text-xs font-mono font-semibold text-emerald-700';
            statusEl.classList.remove('hidden');
          }
          if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>Enviat!</span>';
            submitBtn.style.background = '#CFC7B8';
            submitBtn.style.color = '#2C2825';
          }
          setTimeout(() => {
            if (statusEl) statusEl.classList.add('hidden');
            if (submitBtn) {
              submitBtn.innerHTML = originalHTML;
              submitBtn.style.background = '';
              submitBtn.style.color = '';
              submitBtn.disabled = false;
            }
          }, 4000);
        } else {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${response.status}`);
        }
      } catch (err) {
        console.error('Contact form error:', err);
        if (statusEl) {
          statusEl.textContent = `✗ Error en enviar. ${err.message}`;
          statusEl.className   = 'text-xs font-mono font-semibold text-red-700';
          statusEl.classList.remove('hidden');
        }
        if (submitBtn) {
          submitBtn.disabled  = false;
          submitBtn.innerHTML = originalHTML;
        }
      }
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

  // Inicialización del Card Slider interactivo de proyectos (60fps)
  const initProjectsSlider = () => {
    const slider = document.getElementById('projects-slider');
    const prevBtn = document.getElementById('slider-prev-btn');
    const nextBtn = document.getElementById('slider-next-btn');
    const dotsContainer = document.getElementById('slider-dots');

    if (!slider) return;

    const cards = slider.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    // Calcular el desplazamiento por tarjeta
    const getCardStep = () => {
      if (cards.length > 1) {
        return cards[1].offsetLeft - cards[0].offsetLeft;
      }
      return cards[0].offsetWidth + 24;
    };

    // Crear o actualizar los indicadores de paginación
    const renderDots = () => {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';

      cards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', `Anar al projecte ${idx + 1}`);
        dot.addEventListener('click', () => {
          const targetOffset = cards[idx].offsetLeft - slider.offsetLeft;
          slider.scrollTo({ left: targetOffset, behavior: 'smooth' });
        });
        dotsContainer.appendChild(dot);
      });
    };

    // Actualizar estado de dots y botones de flecha
    const updateSliderControls = () => {
      const step = getCardStep();
      const scrollPos = slider.scrollLeft;
      const activeIdx = Math.min(
        cards.length - 1,
        Math.max(0, Math.round(scrollPos / (step || 1)))
      );

      // Actualizar dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, idx) => {
          if (idx === activeIdx) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }

      // Actualizar botones prev/next
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      if (prevBtn) {
        prevBtn.disabled = scrollPos <= 10;
      }
      if (nextBtn) {
        nextBtn.disabled = scrollPos >= maxScroll - 10;
      }
    };

    renderDots();
    updateSliderControls();

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const step = getCardStep();
        slider.scrollBy({ left: -step, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const step = getCardStep();
        slider.scrollBy({ left: step, behavior: 'smooth' });
      });
    }

    let scrollTimeout;
    slider.addEventListener('scroll', () => {
      cancelAnimationFrame(scrollTimeout);
      scrollTimeout = requestAnimationFrame(updateSliderControls);
    }, { passive: true });

    window.addEventListener('resize', () => {
      updateSliderControls();
    }, { passive: true });

    // Soporte para Mouse Drag (arrastre con ratón en escritorio)
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      hasDragged = false;
      startX = e.pageX - slider.offsetLeft;
      scrollStart = slider.scrollLeft;
      slider.classList.add('cursor-grabbing');
      slider.classList.remove('cursor-grab');
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('cursor-grabbing');
      slider.classList.add('cursor-grab');
    });

    slider.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('cursor-grabbing');
      slider.classList.add('cursor-grab');
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const currentX = e.pageX - slider.offsetLeft;
      const walk = (currentX - startX) * 1.3;
      if (Math.abs(walk) > 4) {
        hasDragged = true;
      }
      slider.scrollLeft = scrollStart - walk;
    });

    // Evitar que el click en los enlaces se active si el usuario estuvo arrastrando
    slider.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          hasDragged = false;
        }
      });
    });
  };

  initProjectsSlider();
});

const track = document.querySelector('.slider');

if (track) {
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
}

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




