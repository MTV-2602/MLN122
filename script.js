"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const nav = document.getElementById("pillNav");
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const backToTop = document.querySelector(".back-to-top");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");

  // --- 1. Audio Synthesizer (Web Audio API) ---
  let audioCtx = null;
  function playClickSound(freq = 1200, duration = 0.05, volume = 0.05) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq / 8, audioCtx.currentTime + duration);
      
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  // Attach soft ticks on hover
  document.querySelectorAll('.nav-links a, .mode-toggle-btn, .accordion-header, .primary-btn, .ghost-btn, .back-to-top, .theme-toggle-btn, .bento-card, .comparison-column').forEach(el => {
    el.addEventListener('mouseenter', () => {
      playClickSound(1600, 0.02, 0.015);
    });
  });

  // --- 2. Scroll Spy Navigation (Traditional Offset-based for 100% Accuracy) ---
  function scrollSpy() {
    const scrollPos = window.scrollY + 160; // Offset of 160px to trigger active link perfectly
    
    let currentSection = null;
    
    // Find which section is currently active
    for (const section of sections) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = section;
      }
    }
    
    if (currentSection) {
      const activeId = currentSection.id;
      
      if (activeId === "hero") {
        navLinks.forEach((link) => link.classList.remove("active"));
      } else {
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          link.classList.toggle("active", href === `#${activeId}`);
        });
      }
    }
  }

  window.addEventListener("scroll", scrollSpy, { passive: true });
  scrollSpy(); // Initial call

  // --- 3. Click Navigation Handler (Forces exact scroll position with click sound) ---
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        playClickSound(900, 0.06, 0.05);
        
        // Target offset subtracting header buffer
        const targetOffset = targetSection.offsetTop - 90;
        
        window.scrollTo({
          top: targetOffset,
          behavior: "smooth"
        });
      }
    });
  });

  // --- 4. Global Theme Switcher (Dark vs Paper) ---
  let currentGlobalTheme = 'dark'; // 'dark' | 'paper'

  const sunSvgPath = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
  const moonSvgPath = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;

  themeToggleBtn?.addEventListener("click", () => {
    playClickSound(900, 0.06, 0.05);
    
    if (currentGlobalTheme === 'dark') {
      currentGlobalTheme = 'paper';
      document.body.classList.remove('theme-forced-dark');
      document.body.classList.add('theme-forced-paper');
      document.body.className = 'theme-paper theme-forced-paper';
      if (themeIcon) themeIcon.innerHTML = sunSvgPath;
      themeToggleBtn.title = "Chuyển sang giao diện Tối";
    } else {
      currentGlobalTheme = 'dark';
      document.body.classList.remove('theme-forced-paper');
      document.body.classList.add('theme-forced-dark');
      document.body.className = 'theme-dark theme-forced-dark';
      if (themeIcon) themeIcon.innerHTML = moonSvgPath;
      themeToggleBtn.title = "Chuyển sang giao diện Sáng (Giấy)";
    }
  });

  // --- 5. Capsule Menu scrolled styling & Back to Top visibility ---
  function updateScrollElements() {
    const scrolled = window.scrollY > 40;
    nav?.classList.toggle("scrolled", scrolled);
    backToTop?.classList.toggle("visible", window.scrollY > 500);
  }

  updateScrollElements();
  window.addEventListener("scroll", updateScrollElements, { passive: true });

  // --- 6. Scroll Reveal & Number Counter Animations ---
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        
        const numElement = entry.target.querySelector('.bento-card-num, .accordion-num');
        if (numElement && !numElement.dataset.animated) {
          animateNumberCounter(numElement);
        }
        
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40% 0px" }
  );

  document.querySelectorAll(".reveal, .accordion-item").forEach((el) => revealObserver.observe(el));

  function animateNumberCounter(el) {
    const targetValStr = el.textContent.trim();
    const targetValInt = parseInt(targetValStr, 10);
    if (isNaN(targetValInt)) return;

    el.dataset.animated = "true";
    let startVal = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = progress * (2 - progress);
      const currentVal = Math.floor(easeProgress * targetValInt);
      
      el.textContent = currentVal < 10 && targetValStr.startsWith('0') ? `0${currentVal}` : currentVal;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.textContent = targetValStr;
      }
    }
    requestAnimationFrame(updateCounter);
  }

  // --- 7. Tab Switcher inside Bento Section ---
  document.querySelectorAll(".mode-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      playClickSound(900, 0.06, 0.05);
      const mode = btn.dataset.mode;

      document.querySelectorAll(".mode-toggle-btn").forEach((item) => {
        const isActive = item === btn;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });

      document.querySelectorAll(".step-content").forEach((content) => {
        const isActive = content.id === `content-${mode}`;
        content.classList.toggle("active", isActive);
        if (isActive) {
          content.querySelectorAll(".reveal").forEach((el, index) => {
            setTimeout(() => el.classList.add("visible"), index * 60);
          });
        }
      });
    });
  });

  // --- 8. Accordion interaction for Hạn chế & Nguy cơ ---
  const accordionHeaders = document.querySelectorAll(".accordion-header");

  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      playClickSound(900, 0.06, 0.05);
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".accordion-item").forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("open");
          otherItem.querySelector(".accordion-content").style.maxHeight = null;
          otherItem.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        content.style.maxHeight = null;
        header.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        content.style.maxHeight = content.scrollHeight + "px";
        header.setAttribute("aria-expanded", "true");
      }
    });
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll(".accordion-item.open").forEach((item) => {
      const content = item.querySelector(".accordion-content");
      content.style.maxHeight = content.scrollHeight + "px";
    });
  });

  // --- 9. Back-to-Top Button Scroll Action ---
  backToTop?.addEventListener("click", () => {
    playClickSound(900, 0.06, 0.05);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
