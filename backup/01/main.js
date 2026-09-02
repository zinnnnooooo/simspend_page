/**
 * SIMSPEND - LANDING PAGE INTERACTION SCRIPT
 * Vanilla JavaScript Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  /* --- 1. HEADER SCROLLED STATE & ACTIVE LINK TRACKING --- */
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header shadow state
    if (scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Section scroll position detection for active nav highlight
    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');
      const currentNavLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (currentNavLink && scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => link.classList.remove('active'));
        currentNavLink.classList.add('active');
      }
    });
  });

  /* --- 2. SMOOTH SCROLL WITH HEADER OFFSET --- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 64;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  /* --- 3. SUBTLE CARD & TAG PARALLAX TILT EFFECT --- */
  const overviewVisual = document.querySelector('.overview-visual');
  const floatingCards = document.querySelectorAll('.floating-card');

  if (overviewVisual && floatingCards.length > 0) {
    overviewVisual.addEventListener('mousemove', (e) => {
      const rect = overviewVisual.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      floatingCards.forEach((card, index) => {
        const factor = (index + 1) * 0.03;
        card.style.transform = `translate(${x * factor}px, ${y * factor - 4}px)`;
      });
    });

    overviewVisual.addEventListener('mouseleave', () => {
      floatingCards.forEach((card) => {
        card.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  /* --- 4. SECTION 2 PINNED SCROLL: FIXED LEFT TEXT FADE + RIGHT MOCKUP VERTICAL SLIDE --- */
  const overviewSection = document.getElementById('overview');
  const textItems = document.querySelectorAll('.overview-text-item');
  const phoneSteps = document.querySelectorAll('.overview-phone-step');
  let currentStepIndex = 0;

  function handleOverviewScroll() {
    if (!overviewSection || textItems.length === 0 || phoneSteps.length === 0) return;

    const rect = overviewSection.getBoundingClientRect();
    const scrollDistance = overviewSection.offsetHeight - window.innerHeight;

    if (scrollDistance <= 0) return;

    const currentScroll = -rect.top;
    let progress = currentScroll / scrollDistance;
    progress = Math.max(0, Math.min(1, progress));

    const numSteps = Math.min(textItems.length, phoneSteps.length);
    let stepIndex = Math.floor(progress * numSteps);
    if (stepIndex >= numSteps) stepIndex = numSteps - 1;

    if (stepIndex !== currentStepIndex) {
      // 1. Left Text: Pure Cross Fade (No position translation)
      textItems.forEach((textItem, idx) => {
        if (idx === stepIndex) {
          textItem.classList.add('active');
        } else {
          textItem.classList.remove('active');
        }
      });

      // 2. Right Phone: Vertical Slide (translateY)
      phoneSteps.forEach((phoneStep, idx) => {
        if (idx === stepIndex) {
          phoneStep.className = 'overview-phone-step active';
        } else if (idx < stepIndex) {
          phoneStep.className = 'overview-phone-step exit-up';
        } else {
          phoneStep.className = 'overview-phone-step exit-down';
        }
      });

      currentStepIndex = stepIndex;
    }
  }

  window.addEventListener('scroll', handleOverviewScroll, { passive: true });
  handleOverviewScroll();
});
