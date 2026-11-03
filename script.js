/* ==================== SHARED BUTTON FUNCTIONALITY START ==================== */
document.addEventListener("DOMContentLoaded", () => {
  function setButtonLabel(button, label) {
    const labelElement = document.createElement("span");
    labelElement.className = "btn-label";
    Array.from(label).forEach((character, index) => {
      const letter = document.createElement("span");
      letter.className = "btn-letter";
      letter.style.setProperty("--letter-index", index);
      letter.textContent = character;
      labelElement.append(letter);
    });

    button.querySelector(".btn-label")?.remove();
    Array.from(button.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .forEach(node => node.remove());
    const icon = Array.from(button.children).find(child => child.tagName === "SPAN");
    button.insertBefore(labelElement, icon ?? null);
    button.setAttribute("aria-label", label);
  }

  document.querySelectorAll(".btn").forEach(button => {
    if (button.closest(".insight-card .body")) return;

    const label = Array.from(button.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent)
      .join("")
      .trim();
    if (label) setButtonLabel(button, label);
  });

  /* ==================== SHARED BUTTON FUNCTIONALITY END ==================== */

  /* ==================== HEADER NAVIGATION FUNCTIONALITY START ==================== */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll(".main-nav a");
  const mobileViewport = window.matchMedia("(max-width: 920px)");

  function closeMenu() {
    menuToggle.classList.remove("active");
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    nav.inert = mobileViewport.matches;
  }
  nav.inert = mobileViewport.matches;
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    nav.inert = mobileViewport.matches && !isOpen;
  });
  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  mobileViewport.addEventListener("change", closeMenu);
  /* ==================== HEADER NAVIGATION FUNCTIONALITY END ==================== */

  /* ==================== ABOUT CAMERA AND TELEVISION FUNCTIONALITY START ==================== */
  const aboutPanel = document.querySelector("#about .about");
  const aboutCamera = aboutPanel?.querySelector(".about-camera");
  const aboutTv = aboutPanel?.querySelector(".about-tv");
  const aboutTvClose = aboutPanel?.querySelector(".about-tv-close");
  const aboutTvVideo = aboutPanel?.querySelector(".about-tv-video");
  const aboutTvStatus = aboutPanel?.querySelector(".about-tv-status");

  if (
    aboutPanel &&
    aboutCamera &&
    aboutTv &&
    aboutTvClose &&
    aboutTvVideo &&
    aboutTvStatus
  ) {
    function setAboutTvOpen(isOpen, returnFocus = false) {
      aboutCamera.setAttribute("aria-expanded", String(isOpen));
      aboutCamera.setAttribute(
        "aria-label",
        isOpen
          ? "Close the Oyster Security advertisement"
          : "Play the Oyster Security advertisement"
      );
      aboutTv.setAttribute("aria-hidden", String(!isOpen));
      aboutTv.inert = !isOpen;
      aboutPanel.classList.toggle("tv-open", isOpen);

      if (isOpen) {
        aboutTvClose.focus();
        aboutTvVideo.play().catch(() => {
          aboutTvStatus.textContent = aboutTvVideo.error
            ? "Add video/oyster-security-ad.mp4 to play the advertisement."
            : "Playback did not start. Use the player controls to try again.";
        });
      } else {
        aboutTvVideo.pause();
        if (aboutTvVideo.readyState > 0) aboutTvVideo.currentTime = 0;
        aboutTvStatus.textContent = "";
        if (returnFocus) aboutCamera.focus();
      }
    }

    aboutCamera.addEventListener("click", () => {
      setAboutTvOpen(aboutCamera.getAttribute("aria-expanded") !== "true", true);
    });
    aboutTvClose.addEventListener("click", () => setAboutTvOpen(false, true));

    document.addEventListener("pointerdown", event => {
      if (
        aboutCamera.getAttribute("aria-expanded") === "true" &&
        !aboutTv.contains(event.target) &&
        !aboutCamera.contains(event.target)
      ) {
        setAboutTvOpen(false);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && aboutCamera.getAttribute("aria-expanded") === "true") {
        setAboutTvOpen(false, true);
      }
    });
  }
  /* ==================== ABOUT CAMERA AND TELEVISION FUNCTIONALITY END ==================== */

  /* ==================== INTRO AND SERVICES ENTRANCE ANIMATIONS START ==================== */
  const introStrip = document.querySelector(".intro-strip");
  const servicesSection = document.querySelector(".services-section");
  const serviceHeading = servicesSection?.querySelector(".section-heading");
  const originalServiceCards = Array.from(
    servicesSection?.querySelectorAll(".service-card") ?? []
  );
  const canAnimateScrollSections =
    window.anime && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (canAnimateScrollSections && introStrip && servicesSection && serviceHeading) {
    const introTargets = [
      ...introStrip.querySelectorAll(".intro-word"),
      ...introStrip.querySelectorAll(".trust-points span")
    ].filter(Boolean);
    const serviceHeadingTargets = Array.from(serviceHeading.children);
    const servicesTargets = [...serviceHeadingTargets, ...originalServiceCards];
    const animatedTargets = [...introTargets, ...servicesTargets];

    introStrip.classList.remove("reveal");
    serviceHeading.classList.remove("reveal");
    originalServiceCards.forEach(card => card.classList.remove("reveal"));
    window.anime.set(animatedTargets, { opacity: 0, translateY: 24 });

    function playSectionAnimation(section) {
      if (section === introStrip) {
        window.anime.timeline()
          .add({
            targets: introStrip.querySelectorAll(".intro-word"),
            opacity: [0, 1],
            translateY: [18, 0],
            scale: [0.92, 1],
            delay: window.anime.stagger(120),
            duration: 550,
            easing: "easeOutCubic"
          })
          .add({
            targets: introStrip.querySelectorAll(".trust-points span"),
            opacity: [0, 1],
            translateY: [24, 0],
            delay: window.anime.stagger(130),
            duration: 600,
            easing: "easeOutCubic"
          }, "-=300");
        return;
      }

      window.anime.timeline()
        .add({
          targets: serviceHeadingTargets,
          opacity: [0, 1],
          translateY: [24, 0],
          delay: window.anime.stagger(100),
          duration: 650,
          easing: "easeOutCubic"
        })
        .add({
          targets: originalServiceCards,
          opacity: [0, 1],
          translateY: [30, 0],
          delay: window.anime.stagger(120),
          duration: 700,
          easing: "easeOutCubic"
        }, "-=250");
    }

    if ("IntersectionObserver" in window) {
      const sectionAnimationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            playSectionAnimation(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      sectionAnimationObserver.observe(introStrip);
      sectionAnimationObserver.observe(servicesSection);
    } else {
      playSectionAnimation(introStrip);
      playSectionAnimation(servicesSection);
    }
  }
  /* ==================== INTRO AND SERVICES ENTRANCE ANIMATIONS END ==================== */

  /* ==================== REVEAL ANIMATIONS START ==================== */
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }
  /* ==================== REVEAL ANIMATIONS END ==================== */

  /* ==================== SERVICES CAROUSEL FUNCTIONALITY START ==================== */
  const serviceViewport = servicesSection.querySelector(".service-viewport");
  const serviceTrack = serviceViewport.querySelector(".service-grid");
  const serviceCards = Array.from(serviceTrack.querySelectorAll(".service-card"));
  const servicePagination = servicesSection.querySelector(".service-pagination");
  const servicePaginationDots = Array.from(
    servicePagination.querySelectorAll("[data-service-index]")
  );
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let serviceTween;
  let serviceScrollTrigger;
  let serviceLoopWidth = 0;
  let nativeLoopHandler;
  let pointerDrag;
  let draggedServiceCard = false;
  let carouselMode;

  function updateActiveServiceCard() {
    const cards = Array.from(serviceTrack.querySelectorAll(".service-card"));
    if (!cards.length) return;

    const viewportCenter =
      serviceViewport.getBoundingClientRect().left + serviceViewport.clientWidth / 2;
    let activeCard = cards[0];
    let shortestDistance = Infinity;
    cards.forEach(card => {
      const bounds = card.getBoundingClientRect();
      const distance = Math.abs(bounds.left + bounds.width / 2 - viewportCenter);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        activeCard = card;
      }
    });
    cards.forEach(card => card.classList.toggle("is-active", card === activeCard));
    const activeIndex = cards.indexOf(activeCard) % serviceCards.length;
    servicePaginationDots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", String(isActive));
    });
  }

  function makeServiceClones() {
    return serviceCards.map(card => {
      const clone = card.cloneNode(true);
      clone.classList.remove("reveal", "is-visible");
      clone.style.removeProperty("opacity");
      clone.style.removeProperty("transform");
      clone.dataset.serviceClone = "true";
      clone.setAttribute("aria-hidden", "true");
      clone.inert = true;
      return clone;
    });
  }

  function measureServiceLoop() {
    const first = serviceCards[0];
    const last = serviceCards[serviceCards.length - 1];
    return last.offsetLeft + last.offsetWidth - first.offsetLeft;
  }

  function clearServiceCarousel() {
    serviceTween?.scrollTrigger?.kill();
    serviceTween?.kill();
    serviceTween = null;
    serviceScrollTrigger = null;
    serviceTrack.querySelectorAll("[data-service-clone]").forEach(clone => clone.remove());
    serviceTrack.querySelectorAll(".service-card").forEach(card => {
      card.classList.remove("is-active");
    });
    serviceTrack.style.removeProperty("transform");
    serviceViewport.removeEventListener("scroll", nativeLoopHandler);
    nativeLoopHandler = null;
    servicesSection.classList.remove("is-carousel", "is-pinned-carousel");
  }

  function setupServiceCarousel() {
    const canPin =
      window.gsap &&
      window.ScrollTrigger &&
      window.innerWidth > 900 &&
      !reducedMotion.matches;
    const nextMode = canPin ? "pinned" : "native";
    if (carouselMode === nextMode && nextMode === "pinned") {
      window.ScrollTrigger.refresh();
      return;
    }

    clearServiceCarousel();
    carouselMode = nextMode;
    servicesSection.classList.add("is-carousel");

    if (canPin) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      makeServiceClones().forEach(clone => serviceTrack.append(clone));
      servicesSection.classList.add("is-pinned-carousel");
      serviceLoopWidth = measureServiceLoop();
      serviceTween = window.gsap.to(serviceTrack, {
        x: () => -measureServiceLoop(),
        ease: "none",
        scrollTrigger: {
          trigger: servicesSection,
          pin: true,
          start: "top top",
          end: () => `+=${measureServiceLoop()}`,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / serviceCards.length,
            duration: { min: 0.15, max: 0.55 },
            delay: 0.08,
            ease: "power1.inOut"
          },
          onUpdate: updateActiveServiceCard,
          onRefresh: updateActiveServiceCard
        }
      });
      serviceScrollTrigger = serviceTween.scrollTrigger;
      serviceViewport.scrollLeft = 0;
      updateActiveServiceCard();
      return;
    }

    const clones = makeServiceClones();
    const before = document.createDocumentFragment();
    clones.forEach(clone => before.append(clone));
    serviceTrack.prepend(before);
    makeServiceClones().forEach(clone => serviceTrack.append(clone));
    serviceLoopWidth = measureServiceLoop();
    serviceViewport.scrollLeft = serviceLoopWidth;
    nativeLoopHandler = () => {
      if (serviceViewport.scrollLeft < serviceLoopWidth * 0.5) {
        serviceViewport.scrollLeft += serviceLoopWidth;
      } else if (serviceViewport.scrollLeft > serviceLoopWidth * 1.5) {
        serviceViewport.scrollLeft -= serviceLoopWidth;
      }
      updateActiveServiceCard();
    };
    serviceViewport.addEventListener("scroll", nativeLoopHandler, { passive: true });
    updateActiveServiceCard();
  }

  if (serviceCards.length > 1) {
    setupServiceCarousel();
    servicePaginationDots.forEach(dot => {
      dot.addEventListener("click", () => {
        const index = Number(dot.dataset.serviceIndex);
        if (!Number.isInteger(index) || index < 0 || index >= serviceCards.length) return;

        if (serviceScrollTrigger) {
          const progress = index / serviceCards.length;
          serviceScrollTrigger.scroll(
            serviceScrollTrigger.start +
            progress * (serviceScrollTrigger.end - serviceScrollTrigger.start)
          );
          serviceScrollTrigger.update();
        } else {
          serviceViewport.scrollTo({
            left: serviceCards[index].offsetLeft,
            behavior: reducedMotion.matches ? "auto" : "smooth"
          });
        }
      });
    });
    serviceViewport.addEventListener("pointerdown", event => {
      if (event.button !== 0 || (event.pointerType === "touch" && !serviceScrollTrigger)) return;
      draggedServiceCard = false;
      pointerDrag = {
        id: event.pointerId,
        startX: event.clientX,
        startScroll: serviceViewport.scrollLeft,
        startProgress: serviceScrollTrigger?.progress ?? 0,
        moved: false
      };
    });
    window.addEventListener("pointermove", event => {
      if (!pointerDrag || event.pointerId !== pointerDrag.id) return;
      const deltaX = event.clientX - pointerDrag.startX;
      if (!pointerDrag.moved && Math.abs(deltaX) < 6) return;
      pointerDrag.moved = true;
      draggedServiceCard = true;
      event.preventDefault();
      if (serviceScrollTrigger) {
        const progress = window.gsap.utils.wrap(
          0,
          1,
          pointerDrag.startProgress - deltaX / serviceLoopWidth
        );
        serviceScrollTrigger.scroll(
          serviceScrollTrigger.start +
          progress * (serviceScrollTrigger.end - serviceScrollTrigger.start)
        );
        serviceScrollTrigger.update();
      } else {
        serviceViewport.scrollLeft = pointerDrag.startScroll - deltaX;
      }
    }, { passive: false });
    window.addEventListener("pointerup", event => {
      if (!pointerDrag || event.pointerId !== pointerDrag.id) return;
      const completedDrag = pointerDrag;
      pointerDrag = null;
      if (completedDrag.moved && !serviceScrollTrigger) {
        const cards = Array.from(serviceTrack.children);
        const nearestCard = cards.reduce((nearest, card) => {
          return Math.abs(card.offsetLeft - serviceViewport.scrollLeft) <
            Math.abs(nearest.offsetLeft - serviceViewport.scrollLeft)
            ? card
            : nearest;
        });
        serviceViewport.scrollTo({ left: nearestCard.offsetLeft, behavior: "smooth" });
      }
    });
    serviceViewport.addEventListener("click", event => {
      if (!draggedServiceCard) return;
      event.preventDefault();
      event.stopPropagation();
      draggedServiceCard = false;
    }, true);

    let carouselResizeTimer;
    window.addEventListener("resize", () => {
      window.clearTimeout(carouselResizeTimer);
      carouselResizeTimer = window.setTimeout(setupServiceCarousel, 150);
    });
    reducedMotion.addEventListener("change", setupServiceCarousel);
  }

  /* ==================== SERVICES CAROUSEL FUNCTIONALITY END ==================== */

  /* ==================== CONTACT ORNAMENT ANIMATION START ==================== */
  const contactOrnament = document.querySelector(".contact-ornament img");
  const contactSection = document.querySelector(".contact-section");
  if (
    contactOrnament &&
    contactSection &&
    window.gsap &&
    !reducedMotion.matches
  ) {
    let targetRotation = Number(window.gsap.getProperty(contactOrnament, "rotation")) || 0;
    contactSection.addEventListener("wheel", event => {
      const bounds = contactOrnament.getBoundingClientRect();
      const pointerOverImage =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;
      if (!pointerOverImage || event.deltaY === 0) return;

      targetRotation += event.deltaY * 0.6;
      window.gsap.killTweensOf(contactOrnament, "rotation");
      window.gsap.to(contactOrnament, {
        rotation: targetRotation,
        transformOrigin: "50% 50%",
        duration: 0.35,
        ease: "none"
      });
    }, { passive: true });
  }
  /* ==================== CONTACT ORNAMENT ANIMATION END ==================== */

  /* ==================== CONTACT FORM FUNCTIONALITY START ==================== */
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const message = form.querySelector(".form-message");
    message.textContent = "This demo form is not connected to a submission service. Your enquiry was not sent.";
  });
  /* ==================== CONTACT FORM FUNCTIONALITY END ==================== */

  /* ==================== FOOTER CONTROLS START ==================== */
  const topButton = document.querySelector(".back-to-top");
  window.addEventListener("scroll", () => {
    topButton.classList.toggle("visible", window.scrollY > 550);
  }, { passive: true });
  topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  const yearElement = document.getElementById("year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();
  /* ==================== FOOTER CONTROLS END ==================== */

  /* ==================== HERO SECURITY ICON ANIMATION START ==================== */
  (function heroArc() {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const icons = [
      { src: "image/bnr_ic_1.png" },
      { src: "image/bnr_ic_2.png" },
      { src: "image/bnr_ic_3.png" },
      { src: "image/bnr_ic_4.png" },
      { src: "image/bnr_ic_5.png" }
    ];
    const pts = [[580, 350], [647.37, 187.37], [810, 120], [972.63, 187.37], [1040, 350]];
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "hero-arc");
    svg.setAttribute("viewBox", "560 110 520 300");
    svg.setAttribute("aria-hidden", "true");
    const ns = "http://www.w3.org/2000/svg";
    const arc = document.createElementNS(ns, "path");
    arc.setAttribute("class", "arc");
    arc.setAttribute("d", "M580 350 A230 230 0 0 1 1040 350");
    svg.append(arc);

    const startDot = document.createElementNS(ns, "circle");
    startDot.setAttribute("class", "start-dot");
    startDot.setAttribute("cx", "580");
    startDot.setAttribute("cy", "350");
    startDot.setAttribute("r", "4");
    svg.append(startDot);

    const nodes = icons.map(icon => {
      const node = document.createElementNS(ns, "g");
      node.setAttribute("class", "node");
      const pulse = document.createElementNS(ns, "circle");
      pulse.setAttribute("class", "pulse");
      pulse.setAttribute("r", "26");
      node.append(pulse);

      const inner = document.createElementNS(ns, "g");
      inner.setAttribute("class", "in");
      const ring = document.createElementNS(ns, "circle");
      ring.setAttribute("class", "ring");
      ring.setAttribute("r", "26");
      inner.append(ring);

      const image = document.createElementNS(ns, "image");
      image.setAttribute("class", "node-image");
      image.setAttribute("x", "-16");
      image.setAttribute("y", "-16");
      image.setAttribute("width", "32");
      image.setAttribute("height", "32");
      image.setAttribute("href", icon.src);
      image.setAttribute("preserveAspectRatio", "xMidYMid meet");
      inner.append(image);
      node.append(inner);
      svg.append(node);
      return node;
    });
    hero.append(svg);

    const length = arc.getTotalLength();
    const stops = pts.map((q, i) => {
      let best = 0, bestDist = Infinity;
      for (let l = 0; l <= length; l += 2) {
        const p = arc.getPointAtLength(l);
        const dist = (p.x - q[0]) ** 2 + (p.y - q[1]) ** 2;
        if (dist < bestDist) { bestDist = dist; best = l; }
      }
      nodes[i].setAttribute("transform", `translate(${q[0]},${q[1]})`);
      nodes[i].style.setProperty("--d", `${i * 0.3}s`);
      return best / length;
    });
    arc.style.strokeDasharray = length;
    arc.style.strokeDashoffset = length;
    const opened = [];
    const duration = reduce ? 1 : 4200;
    let start = null;
    function tick(now) {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      arc.style.strokeDashoffset = length * (1 - e);
      nodes.forEach((n, i) => {
        if (!opened[i] && e >= stops[i] - 0.015) { opened[i] = true; n.classList.add("on"); }
      });
      if (t < 1) requestAnimationFrame(tick);
    }
    setTimeout(() => {
      startDot.classList.add("on");
      setTimeout(() => requestAnimationFrame(tick), 500);
    }, 600);
  })();
  /* ==================== HERO SECURITY ICON ANIMATION END ==================== */
});

/* ==================== FEATURES SCROLL ANIMATION START ==================== */
(function () {
  var section = document.getElementById("sec");
  var slides = Array.from(document.querySelectorAll(".slide"));
  var items = Array.from(document.querySelectorAll(".it"));
  var progressBar = document.getElementById("bar");
  var progressLabel = document.getElementById("prog");
  var world = document.getElementById("world");
  var itemCount = slides.length;
  var target = 0;
  var current = 0;
  var lastActive = -1;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function readScrollProgress() {
    var bounds = section.getBoundingClientRect();
    var scrollableHeight = Math.max(section.offsetHeight - innerHeight, 1);
    target = clamp(-bounds.top / scrollableHeight, 0, 0.9999) * itemCount;
  }

  function setActiveItem(index) {
    if (index === lastActive) return;
    lastActive = index;
    items.forEach(function (item, itemIndex) {
      item.classList.toggle("on", itemIndex === index);
      item.classList.toggle("past", itemIndex < index);
    });
    progressLabel.textContent = "0" + (index + 1) + " / 0" + itemCount;
    setTimeout(function () {
      var activeItem = items[index];
      progressBar.style.top = activeItem.offsetTop + "px";
      progressBar.style.height = activeItem.offsetHeight + "px";
    }, 30);
  }

  function renderFrame() {
    current += (target - current) * 0.09;
    slides.forEach(function (slide, index) {
      var offset = current - index - 0.5;
      var distance = Math.abs(offset);
      var opacity = clamp(1 - distance * 2.1, 0, 1);
      var rotateY = offset * -95 + Math.sin(current * 1.4) * 6;
      var rotateX = -6 + offset * 14;
      var translateZ = -distance * 320;
      var translateX = offset * 220;
      var scale = 1 + (0.5 - distance) * 0.18;

      slide.style.opacity = opacity;
      slide.style.transform =
        "translate3d(" + translateX + "px, 0, " + translateZ +
        "px) rotateY(" + rotateY + "deg) rotateX(" + rotateX +
        "deg) scale(" + scale + ")";
      slide.style.visibility = opacity < 0.01 ? "hidden" : "visible";
    });
    world.style.transform =
      "rotateY(" + Math.sin(current * Math.PI) * -4 + "deg) translateY(" +
      (current % 1 - 0.5) * -18 + "px)";
    setActiveItem(clamp(Math.floor(target), 0, itemCount - 1));
    requestAnimationFrame(renderFrame);
  }

  addEventListener("scroll", readScrollProgress, { passive: true });
  addEventListener("resize", function () {
    readScrollProgress();
    lastActive = -1;
  });
  readScrollProgress();
  current = target;
  requestAnimationFrame(renderFrame);
})();
/* ==================== FEATURES SCROLL ANIMATION END ==================== */

/* ==================== DEVICES CAROUSEL FUNCTIONALITY START ==================== */
const devices = [
  { name: "Fiber", image: "image/device_1.png" },
  { name: "Drones", image: "image/device_2.png" },
  { name: "Security Cameras", image: "image/device_3.png" },
  { name: "Wireless Networks", image: "image/device_4.png" },
  { name: "Intrusion", image: "image/device_5.png" }
];
const names = devices.map(device => device.name);
const sw = document.getElementById("swiper");
const dotsEl = document.getElementById("dots");
let active = 2;
let timer;
let isDragging = false;
let pointerId = null;
let dragStartX = 0;
let dragDistance = 0;
let moved = false;
let lastWheelTime = -Infinity;

sw.setAttribute("role", "region");
sw.setAttribute("aria-label", "Our devices");
sw.setAttribute("tabindex", "0");

devices.forEach(({ name, image }, index) => {
  const slide = document.createElement("div");
  slide.className = "device-slide";
  slide.setAttribute("role", "group");
  slide.setAttribute("aria-label", `${index + 1} of ${names.length}: ${name}`);
  const imageElement = document.createElement("img");
  imageElement.src = image;
  imageElement.alt = "";
  imageElement.draggable = false;
  const label = document.createElement("span");
  label.textContent = name;
  const arrow = document.createElement("div");
  arrow.className = "go";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  slide.append(imageElement, label, arrow);
  slide.addEventListener("click", () => {
    if (!moved) go(index);
  });
  sw.appendChild(slide);

  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Show ${name}`);
  dot.setAttribute("aria-pressed", "false");
  dot.addEventListener("click", () => go(index));
  dotsEl.appendChild(dot);
});
const slides = Array.from(sw.children);
const dots = Array.from(dotsEl.children);

function getSlideGap() {
  return window.innerWidth < 640 ? 150 : 250;
}

function layout(dragOffset = 0) {
  const visualActive = active + dragOffset;
  slides.forEach((slide, index) => {
    const offset = index - visualActive;
    const distance = Math.abs(offset);
    slide.style.transform = `translateX(${offset * getSlideGap()}px) translateZ(${-distance * 140}px) rotateY(${-offset * 38}deg) scale(${distance < 0.5 ? 1.06 : 0.92})`;
    slide.style.opacity = distance > 2 ? 0 : 1 - distance * 0.25;
    slide.style.zIndex = String(10 - Math.round(distance));
    slide.style.pointerEvents = distance > 2 ? "none" : "auto";
    slide.classList.toggle("active", distance < 0.5);
    slide.setAttribute("aria-hidden", String(distance >= 0.5));
  });
  dots.forEach((dot, index) => {
    dot.setAttribute("aria-pressed", String(index === active));
  });
}

function go(index) {
  active = (index + names.length) % names.length;
  layout();
  restart();
}

function restart() {
  window.clearInterval(timer);
  timer = window.setInterval(() => go(active + 1), 3500);
}

sw.addEventListener("wheel", event => {
  if (event.ctrlKey) return;
  const delta =
    Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;
  if (Math.abs(delta) < 12) return;

  event.preventDefault();
  const now = performance.now();
  if (now - lastWheelTime < 450) return;
  lastWheelTime = now;
  go(active + (delta > 0 ? 1 : -1));
}, { passive: false });

sw.addEventListener("pointerdown", event => {
  if (event.button !== 0 || !event.isPrimary) return;
  isDragging = true;
  pointerId = event.pointerId;
  dragStartX = event.clientX;
  dragDistance = 0;
  moved = false;
  window.clearInterval(timer);
  sw.classList.add("drag");
});

window.addEventListener("pointermove", event => {
  if (!isDragging || event.pointerId !== pointerId) return;
  dragDistance = event.clientX - dragStartX;
  if (Math.abs(dragDistance) < 6) return;
  moved = true;
  event.preventDefault();
  layout(-dragDistance / getSlideGap());
}, { passive: false });

function finishDrag(event, cancelled = false) {
  if (!isDragging || event.pointerId !== pointerId) return;
  isDragging = false;
  pointerId = null;
  sw.classList.remove("drag");

  const distance = dragDistance;
  dragDistance = 0;
  if (!cancelled && moved && Math.abs(distance) > 40) {
    const steps = Math.max(1, Math.round(Math.abs(distance) / getSlideGap()));
    go(active + (distance < 0 ? steps : -steps));
  } else {
    layout();
    restart();
  }
  if (moved) window.setTimeout(() => { moved = false; }, 0);
}

window.addEventListener("pointerup", event => finishDrag(event));
window.addEventListener("pointercancel", event => finishDrag(event, true));

sw.addEventListener("click", event => {
  if (!moved) return;
  event.preventDefault();
  event.stopPropagation();
}, true);

sw.addEventListener("keydown", event => {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    go(active + 1);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    go(active - 1);
  } else if (event.key === "Home") {
    event.preventDefault();
    go(0);
  } else if (event.key === "End") {
    event.preventDefault();
    go(names.length - 1);
  }
});

window.addEventListener("resize", () => layout());
layout();
restart();
/* ==================== DEVICES CAROUSEL FUNCTIONALITY END ==================== */

/* ==================== DEVICES AND ABOUT SCROLL TRANSFORMS START ==================== */
const panels = Array.from(document.querySelectorAll("#devices.panel, #about.panel"));
let isPanelFramePending = false;

function updatePanelTransforms() {
  const viewportHeight = innerHeight;
  panels.forEach(panel => {
    const bounds = panel.getBoundingClientRect();
    let distanceFromCenter;

    if (panel.id === "devices") {
      let sectionTop = panel.offsetTop;
      let ancestor = panel.offsetParent;
      while (ancestor) {
        sectionTop += ancestor.offsetTop;
        ancestor = ancestor.offsetParent;
      }
      distanceFromCenter =
        (sectionTop + panel.offsetHeight / 2 - scrollY - viewportHeight / 2) /
        viewportHeight;
    } else {
      distanceFromCenter =
        (bounds.top + bounds.height / 2 - viewportHeight / 2) / viewportHeight;
    }

    distanceFromCenter = Math.max(-1.2, Math.min(1.2, distanceFromCenter));
    const distance = Math.abs(distanceFromCenter);
    const rotation = panel.id === "devices"
      ? Math.max(-1, Math.min(1, distanceFromCenter)) * -60
      : distanceFromCenter * -28;
    panel.style.transform =
      `rotateX(${rotation}deg) translateZ(${-distance * 320}px) scale(${1 - distance * 0.12})`;
    panel.style.opacity = Math.max(0, 1 - distance * 0.9);
  });
  isPanelFramePending = false;
}

addEventListener("scroll", () => {
  if (isPanelFramePending) return;
  isPanelFramePending = true;
  requestAnimationFrame(updatePanelTransforms);
}, { passive: true });
addEventListener("resize", updatePanelTransforms);
updatePanelTransforms();
/* ==================== DEVICES AND ABOUT SCROLL TRANSFORMS END ==================== */

/* ==================== INSIGHTS CARD INTERACTIONS START ==================== */
const insightGrid = document.querySelector(".insight-grid");
if (insightGrid) {
  const insightCards = Array.from(insightGrid.querySelectorAll(".insight-card"));
  const desktopInsightLayout = matchMedia("(min-width: 801px)");
  const reducedInsightMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let activeInsightIndex = -1;
  let insightProgressTween;

  function activateInsightCard(index) {
    if (!insightCards.length) return;
    activeInsightIndex = (index + insightCards.length) % insightCards.length;
    insightCards.forEach((card, cardIndex) => {
      const isActive = cardIndex === activeInsightIndex;
      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-expanded", String(isActive));
    });

    if (insightProgressTween) insightProgressTween.kill();
    if (!window.gsap || !desktopInsightLayout.matches || reducedInsightMotion.matches) {
      return;
    }

    const progressBars = insightCards.map(card => card.querySelector(".bar i"));
    window.gsap.set(progressBars, { scaleX: 0 });
    insightProgressTween = window.gsap.to(progressBars[activeInsightIndex], {
      scaleX: 1,
      duration: 6,
      ease: "none",
      onComplete: () => activateInsightCard(activeInsightIndex + 1),
    });
    if (insightGrid.matches(":hover")) insightProgressTween.pause();
  }

  insightCards.forEach((card, index) => {
    card.addEventListener("pointerenter", () => activateInsightCard(index));
    card.addEventListener("focusin", () => activateInsightCard(index));
    card.addEventListener("click", event => {
      if (event.target.closest("a, button")) return;
      activateInsightCard(index);
    });
    card.addEventListener("keydown", event => {
      if (
        event.target !== card ||
        (event.key !== "Enter" && event.key !== " ")
      ) {
        return;
      }
      event.preventDefault();
      activateInsightCard(index);
    });
  });

  insightGrid.addEventListener("mouseenter", () => insightProgressTween?.pause());
  insightGrid.addEventListener("mouseleave", () => insightProgressTween?.resume());
  desktopInsightLayout.addEventListener("change", () =>
    activateInsightCard(Math.max(0, activeInsightIndex)),
  );
  reducedInsightMotion.addEventListener("change", () =>
    activateInsightCard(Math.max(0, activeInsightIndex)),
  );
  if (window.gsap && desktopInsightLayout.matches) {
    window.gsap.from(insightCards, {
      clipPath: "inset(100% 0% 0% 0% round 18px)",
      y: 40,
      duration: reducedInsightMotion.matches ? 0.01 : 1.3,
      ease: "expo.out",
      stagger: 0.14,
      onComplete: () => window.gsap.set(insightCards, { clearProps: "clipPath" }),
    });
  }
  activateInsightCard(0);
}
/* ==================== INSIGHTS CARD INTERACTIONS END ==================== */

/* ==================== 3D CLIENT TESTIMONIALS FUNCTIONALITY START ==================== */

(() => {
  const root = document.querySelector(".client-testimonials3d");
  const stage = root.querySelector("[data-testimonial-stage]");
  const card = root.querySelector("[data-testimonial-card]");
  const quote = root.querySelector("[data-testimonial-quote]");
  const who = root.querySelector("[data-testimonial-who]");
  const testimonials = [
    {
      q: "Oyster delivered exactly what we needed. Their team took the time to understand our requirements, recommended the right technology, and handled every stage of the installation with professionalism. The entire process was seamless, and the final solution has given us greater confidence in our security and infrastructure.",
      w: "Operations Director, Commercial Client",
    },
    {
      q: "From the site survey to the final handover, nothing was left to chance. Our cameras and access control now work as one system, and our staff actually enjoy using it.",
      w: "Facilities Head, Logistics Group",
    },
    {
      q: "They explained every option in plain language and never pushed for more than we needed. The installation finished a day early.",
      w: "Managing Director, Retail Chain",
    },
    {
      q: "Response times are excellent. When we added a second warehouse, the same team scaled our network and surveillance without any downtime.",
      w: "IT Manager, Manufacturing Client",
    },
    {
      q: "Clear communication, tidy work, and a system that runs quietly in the background. Exactly what a growing school campus needs.",
      w: "Administrator, Education Client",
    },
    {
      q: "We trusted Oyster with our most sensitive areas. Their planning and documentation made our audit far easier.",
      w: "Compliance Lead, Healthcare Client",
    },
  ];

  const avatarImages = Array.from(
    { length: 5 },
    (_, index) => `image/user_${index + 1}.png`,
  );
  const slots = [
    [14, 150, 64, 40],
    [68, 70, 56, -40],
    [89, 200, 66, 70],
    [5, 300, 60, 90],
    [26, 470, 46, -30],
  ];
  let current = 0;
  let busy = false;
  let timer;
  const avatars = testimonials.map((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "client-testimonials3d__avatar";
    button.setAttribute(
      "aria-label",
      `Show testimonial ${index + 1}`,
    );
    const image = document.createElement("img");
    image.src = avatarImages[index % avatarImages.length];
    image.alt = "";
    image.draggable = false;
    button.appendChild(image);
    button.addEventListener("click", () => go(index));
    stage.appendChild(button);
    return button;
  });

  function layout() {
    const width = stage.clientWidth;
    avatars.forEach((avatar, index) => {
      const offset =
        (index - current + testimonials.length) %
        testimonials.length;
      if (offset === 0) {
        avatar.classList.add("is-main");
        avatar.classList.remove("is-small");
        Object.assign(avatar.style, {
          left: "50%",
          top: "104px",
          width: "96px",
          height: "96px",
          transform: "translate(-50%,-50%) translateZ(120px)",
          zIndex: 5,
        });
        avatar.tabIndex = -1;
      } else {
        const [x, y, size, depth] = slots[offset - 1];
        avatar.classList.remove("is-main");
        avatar.classList.add("is-small");
        avatar.tabIndex = 0;
        Object.assign(avatar.style, {
          left: `${(x / 100) * width}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`,
          transform: `translate(-50%,-50%) translateZ(${depth}px)`,
          zIndex: 2,
        });
      }
    });
  }

  function show() {
    quote.textContent = `“${testimonials[current].q}”`;
    who.textContent = `— ${testimonials[current].w}`;
  }

  function go(index) {
    if (busy || index === current) return;
    busy = true;
    card.classList.add("is-out");
    current = (index + testimonials.length) % testimonials.length;
    layout();
    window.setTimeout(() => {
      show();
      card.classList.remove("is-out");
      card.classList.add("is-in");
      void card.offsetWidth;
      card.classList.remove("is-in");
      busy = false;
    }, 450);
    restart();
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(() => go(current + 1), 6500);
  }

  root
    .querySelector("[data-testimonial-next]")
    .addEventListener("click", () => go(current + 1));
  root
    .querySelector("[data-testimonial-prev]")
    .addEventListener("click", () => go(current - 1));
  stage.addEventListener("pointerenter", () =>
    window.clearInterval(timer),
  );
  stage.addEventListener("pointerleave", () => {
    restart();
    stage.style.transform = "";
  });
  stage.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stage.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10
      }deg)`;
  });

  const canvas = root.querySelector("[data-testimonial-map]");
  const context = canvas.getContext("2d");
  let dots = [];
  const land = [
    [
      [8, 8],
      [28, 6],
      [34, 14],
      [30, 22],
      [24, 30],
      [20, 34],
      [16, 26],
      [8, 18],
    ],
    [
      [24, 35],
      [34, 37],
      [36, 46],
      [30, 60],
      [26, 52],
      [24, 42],
    ],
    [
      [46, 10],
      [56, 8],
      [58, 16],
      [50, 20],
      [45, 16],
    ],
    [
      [46, 23],
      [58, 23],
      [62, 34],
      [56, 48],
      [50, 46],
      [46, 34],
    ],
    [
      [56, 8],
      [84, 8],
      [90, 18],
      [82, 28],
      [70, 30],
      [62, 24],
      [56, 16],
    ],
    [
      [78, 42],
      [90, 42],
      [90, 52],
      [80, 52],
    ],
  ];

  function buildMap() {
    const width = (canvas.width = stage.clientWidth);
    const height = (canvas.height = stage.clientHeight);
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const offscreenContext = offscreen.getContext("2d");
    const scaleX = (width * 0.78) / 100;
    const scaleY = (height * 0.72) / 60;
    const offsetX = width * 0.11;
    const offsetY = height * 0.28;
    offscreenContext.fillStyle = "#000";
    land.forEach((points) => {
      offscreenContext.beginPath();
      points.forEach(([x, y], index) =>
        offscreenContext[index ? "lineTo" : "moveTo"](
          offsetX + x * scaleX,
          offsetY + y * scaleY,
        ),
      );
      offscreenContext.fill();
    });
    const pixels = offscreenContext.getImageData(
      0,
      0,
      width,
      height,
    ).data;
    dots = [];
    for (let y = 0; y < height; y += 9) {
      for (let x = 0; x < width; x += 9) {
        if (pixels[(y * width + x) * 4 + 3] > 128) {
          dots.push([x, y]);
        }
      }
    }
  }

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  function draw(time) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const rgb = getComputedStyle(root)
      .getPropertyValue("--testimonial-dot")
      .trim();
    for (const [x, y] of dots) {
      const alpha =
        0.14 +
        0.5 *
        Math.max(
          0,
          Math.sin(x * 0.012 - y * 0.006 - time / 900),
        ) **
        6;
      context.fillStyle = `rgba(${rgb},${alpha})`;
      context.beginPath();
      context.arc(x, y, 2.2, 0, 6.283);
      context.fill();
    }
    if (!reducedMotion) {
      window.requestAnimationFrame(draw);
    }
  }

  function init() {
    buildMap();
    layout();
    if (reducedMotion) draw(0);
  }

  window.addEventListener("resize", init);
  show();
  init();
  if (!reducedMotion) {
    window.requestAnimationFrame(draw);
    restart();
  }
})();

/* ==================== 3D CLIENT TESTIMONIALS FUNCTIONALITY END ==================== */
