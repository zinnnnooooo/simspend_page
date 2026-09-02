/**
 * SIMSPEND - LANDING PAGE INTERACTION SCRIPT
 * Vanilla JavaScript Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  /* --- 0. SCROLL SCRUBBING HERO --- */
  const scrollHeroSection = document.getElementById('scroll-hero');
  const heroCanvas = document.getElementById('hero-canvas');
  const heroCopyContainer = document.getElementById('hero-copy-container');
  const heroGradientOverlay = document.getElementById('hero-gradient-overlay');
  const heroEndingCopy = document.getElementById('hero-ending-copy');

  if (scrollHeroSection && heroCanvas) {
    const START_FRAME = 33;
    const END_FRAME = 150;
    const TOTAL_FRAMES = END_FRAME - START_FRAME + 1; // 118
    const frameImages = [];
    let currentFrameIndex = -1;

    function resizeHeroCanvas() {
      const rect = heroCanvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const newWidth = Math.round(rect.width * dpr);
      const newHeight = Math.round(rect.height * dpr);

      if (heroCanvas.width !== newWidth || heroCanvas.height !== newHeight) {
        heroCanvas.width = newWidth;
        heroCanvas.height = newHeight;
      }
      if (currentFrameIndex >= 0) {
        renderHeroFrame(currentFrameIndex);
      }
    }

    function renderHeroFrame(index) {
      const img = frameImages[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const ctx = heroCanvas.getContext('2d');
      const canvasW = heroCanvas.width;
      const canvasH = heroCanvas.height;

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      const canvasRatio = canvasW / canvasH;
      const imgRatio = imgW / imgH;

      let drawW, drawH, drawX, drawY;

      // COVER mode: fill canvas completely without margins
      if (canvasRatio > imgRatio) {
        drawW = canvasW;
        drawH = canvasW / imgRatio;
        drawX = 0;
        drawY = (canvasH - drawH) / 2;
      } else {
        drawH = canvasH;
        drawW = canvasH * imgRatio;
        drawX = (canvasW - drawW) / 2;
        drawY = 0;
      }

      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    function handleHeroScrub() {
      const rect = scrollHeroSection.getBoundingClientRect();
      const scrollDistance = scrollHeroSection.offsetHeight - window.innerHeight;
      if (scrollDistance <= 0) return;

      const currentScroll = -rect.top;
      let progress = currentScroll / scrollDistance;
      progress = Math.max(0, Math.min(1, progress));

      // Accurate frame index mapping: 0% = index 0 (frame 33), 100% = index 117 (frame 150)
      let frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));
      frameIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIndex));

      if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;
        renderHeroFrame(frameIndex);
      }

      // Initial copy & gradient fade out
      let opacity = 1;
      if (progress > 0.20) {
        opacity = Math.max(0, 1 - (progress - 0.20) / 0.40);
      }

      if (heroCopyContainer) {
        heroCopyContainer.style.opacity = opacity;
        heroCopyContainer.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
      }
      if (heroGradientOverlay) {
        heroGradientOverlay.style.opacity = opacity;
        heroGradientOverlay.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
      }

      // Video frame opacity starts fading out around frame 95
      const actualFrameNum = START_FRAME + frameIndex;
      let canvasOpacity = 1;
      let endingOpacity = 0;

      if (actualFrameNum >= 95) {
        canvasOpacity = Math.max(0, 1 - (actualFrameNum - 95) / 40);
      }

      // Ending copy starts fading in at frame 132
      if (actualFrameNum >= 132) {
        endingOpacity = Math.min(1, (actualFrameNum - 131) / 16);
      }

      if (heroCanvas) {
        heroCanvas.style.opacity = canvasOpacity;
      }

      if (heroEndingCopy) {
        heroEndingCopy.style.opacity = endingOpacity;
        heroEndingCopy.style.visibility = endingOpacity <= 0 ? 'hidden' : 'visible';
      }
    }

    for (let i = START_FRAME; i <= END_FRAME; i++) {
      const img = new Image();
      const padNum = String(i).padStart(4, '0');
      img.src = `frames/frame_${padNum}.jpg`;

      const frameIdx = i - START_FRAME;
      img.onload = () => {
        if (frameIdx === 0 && currentFrameIndex === -1) {
          resizeHeroCanvas();
          currentFrameIndex = 0;
          renderHeroFrame(0);
        } else if (frameIdx === currentFrameIndex) {
          renderHeroFrame(frameIdx);
        }
      };
      frameImages.push(img);
    }

    window.addEventListener('resize', resizeHeroCanvas, { passive: true });
    window.addEventListener('scroll', handleHeroScrub, { passive: true });

    resizeHeroCanvas();
    handleHeroScrub();
  }

  /* --- 1. HEADER SCROLLED STATE & ACTIVE LINK TRACKING --- */
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header shadow state
    if (header) {
      if (scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Section scroll position detection for active nav highlight
    if (sections.length > 0) {
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
    }
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
      textItems.forEach((textItem, idx) => {
        if (idx === stepIndex) {
          textItem.classList.add('active');
        } else {
          textItem.classList.remove('active');
        }
      });

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

  /* --- 5. SECTION 3 PINNED SCROLL: FADE IN -> CENTER FOCUS -> 3-STAGE FAN-OUT LINEUP --- */
  const insightSection = document.getElementById('insight');
  const insightHeader = document.querySelector('.insight-header');
  const insightFooter = document.querySelector('.insight-footer-text');
  const fanMain = document.querySelector('.fan-center-main');
  const fanLeft1 = document.querySelector('.fan-left-1');
  const fanRight1 = document.querySelector('.fan-right-1');
  const fanLeft2 = document.querySelector('.fan-left-2');
  const fanRight2 = document.querySelector('.fan-right-2');
  const fanLeft3 = document.querySelector('.fan-left-3');
  const fanRight3 = document.querySelector('.fan-right-3');

  function handleInsightScroll() {
    if (!insightSection || !fanMain) return;

    const rect = insightSection.getBoundingClientRect();
    const scrollDistance = insightSection.offsetHeight - window.innerHeight;

    if (scrollDistance <= 0) return;

    const currentScroll = -rect.top;
    let progress = currentScroll / scrollDistance;
    progress = Math.max(0, Math.min(1, progress));

    const viewportWidth = window.innerWidth;
    const stepX = Math.min(145, Math.max(55, viewportWidth * 0.105));

    // PHASE 01: Fade In
    let pFade = Math.min(1, Math.max(0, progress / 0.16));
    if (insightHeader) insightHeader.style.opacity = pFade;
    if (insightFooter) insightFooter.style.opacity = pFade;

    const mainScale = 0.92 + pFade * 0.08;
    fanMain.style.opacity = pFade;
    fanMain.style.transform = `translate(-50%, -50%) scale(${mainScale})`;

    // PHASE 02: Sequential Fan-Out
    let p1 = Math.min(1, Math.max(0, (progress - 0.18) / 0.30));
    let x1 = stepX * p1;
    let opacity1 = p1 > 0 ? Math.min(1, p1 * 2) * pFade : 0;

    if (fanLeft1) {
      fanLeft1.style.opacity = opacity1;
      fanLeft1.style.transform = `translate(calc(-50% - ${x1}px), -50%) scale(${0.88 + p1 * 0.12})`;
    }
    if (fanRight1) {
      fanRight1.style.opacity = opacity1;
      fanRight1.style.transform = `translate(calc(-50% + ${x1}px), -50%) scale(${0.88 + p1 * 0.12})`;
    }

    let p2 = Math.min(1, Math.max(0, (progress - 0.40) / 0.32));
    let x2 = stepX * 2 * p2;
    let opacity2 = p2 > 0 ? Math.min(1, p2 * 2) * pFade : 0;

    if (fanLeft2) {
      fanLeft2.style.opacity = opacity2;
      fanLeft2.style.transform = `translate(calc(-50% - ${x2}px), -50%) scale(${0.85 + p2 * 0.15})`;
    }
    if (fanRight2) {
      fanRight2.style.opacity = opacity2;
      fanRight2.style.transform = `translate(calc(-50% + ${x2}px), -50%) scale(${0.85 + p2 * 0.15})`;
    }

    let p3 = Math.min(1, Math.max(0, (progress - 0.64) / 0.31));
    let x3 = stepX * 3 * p3;
    let opacity3 = p3 > 0 ? Math.min(1, p3 * 2) * pFade : 0;

    if (fanLeft3) {
      fanLeft3.style.opacity = opacity3;
      fanLeft3.style.transform = `translate(calc(-50% - ${x3}px), -50%) scale(${0.82 + p3 * 0.18})`;
    }
    if (fanRight3) {
      fanRight3.style.opacity = opacity3;
      fanRight3.style.transform = `translate(calc(-50% + ${x3}px), -50%) scale(${0.82 + p3 * 0.18})`;
    }
  }

  window.addEventListener('scroll', handleInsightScroll, { passive: true });
  window.addEventListener('resize', handleInsightScroll, { passive: true });
  handleInsightScroll();

  /* --- 6. HERO INTERACTION (MOUSE TILT & SCROLL PARALLAX & IMPACT REVEAL) --- */
  const heroSection = document.getElementById('hero');
  const heroText = document.querySelector('.hero-text-content');
  const heroTitleLines = document.querySelectorAll('.hero-title-line');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroVisual = document.querySelector('.hero-visual');
  const heroPhoneWrap = document.querySelector('.hero-phone-wrap');
  const phoneGlow = document.querySelector('.hero-section .phone-glow');
  const scrollExplore = document.querySelector('.hero-section .scroll-explore');

  if (heroSection) {
    // Mouse tilt effect (only active when entrance reveal is settled)
    heroSection.addEventListener('mousemove', (e) => {
      if (!heroPhoneWrap) return;
      const heroTop = heroSection.offsetTop;
      const currentScroll = window.scrollY;
      if (heroTop - currentScroll <= 0) {
        const rect = heroSection.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        heroPhoneWrap.style.transform = `rotate(-6deg) translateY(-10px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
      }
    });

    heroSection.addEventListener('mouseleave', () => {
      if (!heroPhoneWrap) return;
      const heroTop = heroSection.offsetTop;
      const currentScroll = window.scrollY;
      if (heroTop - currentScroll <= 0) {
        heroPhoneWrap.style.transform = `rotate(-6deg) translateY(-10px) rotateY(0deg) rotateX(0deg)`;
      }
    });

    // Easing helper with overshoot for punchy impact reveal (peak 1.04 overshoot at p=0.70, settling to 1.0)
    function calcOvershoot(p) {
      if (p <= 0) return 0;
      if (p >= 1) return 1;
      if (p <= 0.70) {
        const t = p / 0.70;
        const easeOut = 1 - Math.pow(1 - t, 3);
        return easeOut * 1.04;
      } else {
        const t = (p - 0.70) / 0.30;
        const settle = Math.sin(t * Math.PI / 2);
        return 1.04 - settle * 0.04;
      }
    }

    function handleHeroParallax() {
      const heroTop = heroSection.offsetTop;
      const heroHeight = heroSection.offsetHeight;
      const windowH = window.innerHeight;
      const currentScroll = window.scrollY;

      const distToHero = heroTop - currentScroll;

      if (distToHero > 0) {
        // IMPACT REVEAL WITH OVERSHOOT: Fast acceleration -> subtle overshoot -> snap rest
        let pEntry = 1 - (distToHero / (windowH * 0.78));
        pEntry = Math.max(0, Math.min(1, pEntry));

        // 1. Smartphone Visual 3D Impact Reveal (scale 0.75 -> 1.04 -> 1.00)
        const pVis = Math.min(1, Math.max(0, pEntry / 0.85));
        const visOvershoot = calcOvershoot(pVis);
        const visScale = 0.75 + visOvershoot * 0.25;

        if (heroVisual) {
          heroVisual.style.opacity = Math.min(1, pVis * 1.6);
        }
        if (heroPhoneWrap) {
          const rotX = (1 - pVis) * 22;
          const rotY = (1 - pVis) * -14;
          const rotZ = -6 + (1 - pVis) * -6;
          const translateY = -10 + (1 - pVis) * 35;
          heroPhoneWrap.style.transform = `rotateZ(${rotZ}deg) translateY(${translateY}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${visScale})`;
        }
        if (phoneGlow) {
          phoneGlow.style.opacity = pVis * 0.8;
        }

        // 2. Fast Masked Line-by-Line Title Reveal (overflow hidden mask style)
        if (heroTitleLines.length > 0) {
          heroTitleLines.forEach((line, idx) => {
            const startP = 0.02 + idx * 0.06;
            const lineP = Math.min(1, Math.max(0, (pEntry - startP) / 0.38));
            const lineOvershoot = calcOvershoot(lineP);
            const translateYPercent = (1 - lineOvershoot) * 100;
            line.style.opacity = Math.min(1, lineP * 2.5);
            line.style.transform = `translateY(${translateYPercent}%)`;
          });
        }

        // 3. Staggered Subtitle & Scroll Explore Reveal
        const pSub = Math.min(1, Math.max(0, (pEntry - 0.22) / 0.40));
        if (heroSubtitle) {
          heroSubtitle.style.opacity = Math.min(1, pSub * 1.8);
          heroSubtitle.style.transform = `translateY(${(1 - Math.min(1, pSub)) * 16}px)`;
        }
        if (scrollExplore) {
          scrollExplore.style.opacity = Math.min(1, pSub * 1.8);
        }
      } else {
        // EXIT / PARALLAX INTERACTION: Scrolling through or past second hero
        const relScroll = currentScroll - heroTop;

        if (heroTitleLines.length > 0) {
          heroTitleLines.forEach((line) => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0%)';
          });
        }
        if (heroSubtitle) {
          heroSubtitle.style.transform = 'translateY(0px)';
        }

        if (relScroll <= heroHeight) {
          const p = relScroll / heroHeight;
          if (heroText) {
            heroText.style.transform = `translateY(${relScroll * 0.25}px)`;
            heroText.style.opacity = Math.max(0, 1 - p * 1.7);
          }
          if (heroVisual) {
            heroVisual.style.transform = `translateY(${relScroll * 0.12}px) scale(${1 - p * 0.06})`;
            heroVisual.style.opacity = Math.max(0, 1 - p * 1.4);
          }
          if (scrollExplore) {
            scrollExplore.style.opacity = Math.max(0, 1 - p * 2.8);
          }
        } else {
          if (heroText) heroText.style.opacity = '0';
          if (heroVisual) heroVisual.style.opacity = '0';
          if (scrollExplore) scrollExplore.style.opacity = '0';
        }
      }
    }

    window.addEventListener('scroll', handleHeroParallax, { passive: true });
    handleHeroParallax();
  }

  /* --- 7. CORE EXPERIENCE SECTION SCROLL REVEAL (DEEP VERTICAL TRAVEL) --- */
  const featuresSection = document.getElementById('features');
  const featuresHeader = document.querySelector('.features-header');
  const featureCards = document.querySelectorAll('.feature-card');

  function handleFeaturesScroll() {
    if (!featuresSection) return;

    const rect = featuresSection.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Generous scroll range across section entry
    const scrollRange = windowH * 1.10;
    const distFromStart = (windowH * 0.95) - rect.top;
    let progress = distFromStart / scrollRange;
    progress = Math.max(0, Math.min(1, progress));

    // 1. Header reveal (progress 0.00 ~ 0.25)
    const pHeader = Math.min(1, Math.max(0, progress / 0.25));
    if (featuresHeader) {
      featuresHeader.style.opacity = pHeader;
      featuresHeader.style.transform = `translateY(${(1 - pHeader) * 40}px)`;
    }

    // 2. Large Deep Vertical Travel Card Reveal
    // Card 01: progress 0.00 ~ 0.45, start translateY: 320px
    // Card 02: progress 0.25 ~ 0.72, start translateY: 340px
    // Card 03: progress 0.50 ~ 0.98, start translateY: 360px
    const cardSpecs = [
      { start: 0.00, end: 0.45, startY: 320 },
      { start: 0.25, end: 0.72, startY: 340 },
      { start: 0.50, end: 0.98, startY: 360 }
    ];

    if (featureCards.length > 0) {
      featureCards.forEach((card, idx) => {
        const spec = cardSpecs[idx] || { start: 0.10 + idx * 0.25, end: 0.45 + idx * 0.25, startY: 320 + idx * 20 };
        const pCard = Math.min(1, Math.max(0, (progress - spec.start) / (spec.end - spec.start)));

        const opacity = Math.min(1, pCard * 1.6);
        const translateY = (1 - pCard) * spec.startY;

        card.style.opacity = opacity;
        card.style.transform = `translateY(${translateY}px)`;
      });
    }
  }

  window.addEventListener('scroll', handleFeaturesScroll, { passive: true });
  handleFeaturesScroll();

  /* --- 8. SECTION 4 & CTA SCROLL REVEAL --- */
  const experienceHeader = document.querySelector('.experience-header');
  const ctaContainer = document.querySelector('.cta-container');

  function handleExperienceScroll() {
    const expSection = document.getElementById('experience');
    if (!expSection) return;

    const rect = expSection.getBoundingClientRect();
    const windowH = window.innerHeight;

    if (rect.top < windowH * 0.85 && rect.bottom > 0) {
      if (experienceHeader) {
        experienceHeader.style.opacity = '1';
        experienceHeader.style.transform = 'translateY(0)';
      }
      if (ctaContainer) {
        ctaContainer.style.opacity = '1';
        ctaContainer.style.transform = 'translateY(0) scale(1)';
      }
    }
  }

  window.addEventListener('scroll', handleExperienceScroll, { passive: true });
  handleExperienceScroll();
});
