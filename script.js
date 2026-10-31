// Shared button labels.
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
    const label = Array.from(button.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent)
      .join("")
      .trim();
    if (label) setButtonLabel(button, label);
  });

  // Header navigation and mobile menu.
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

  // Intro and Services entrance animations.
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

  // Reveal visible content sections.
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

  // Services carousel: draggable, snapping, and responsive to viewport changes.
  const serviceViewport = servicesSection.querySelector(".service-viewport");
  const serviceTrack = serviceViewport.querySelector(".service-grid");
  const serviceCards = Array.from(serviceTrack.querySelectorAll(".service-card"));
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

  // Contact form toggle and demo-only validation feedback.
  const form = document.getElementById("contact-form");
  const formToggle = document.getElementById("contact-form-toggle");
  const formToggleIcon = formToggle.querySelector("[aria-hidden='true']");
  formToggle.addEventListener("click", () => {
    const isOpen = formToggle.getAttribute("aria-expanded") === "true";
    form.hidden = isOpen;
    formToggle.setAttribute("aria-expanded", String(!isOpen));
    setButtonLabel(formToggle, isOpen ? "Open enquiry form" : "Close enquiry form");
    formToggleIcon.textContent = isOpen ? "+" : "−";
    if (!isOpen) {
      form.querySelector("input[name='firstName']").focus();
    }
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const message = form.querySelector(".form-message");
    message.textContent = "This demo form is not connected to a submission service. Your enquiry was not sent.";
  });

  // Back-to-top control and current footer year.
  const topButton = document.querySelector(".back-to-top");
  window.addEventListener("scroll", () => {
    topButton.classList.toggle("visible", window.scrollY > 550);
  }, { passive: true });
  topButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.getElementById("year").textContent = new Date().getFullYear();

  // Hero section: trace the security arc and reveal each icon in sequence.
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
    svg.innerHTML =
      '<path class="arc" d="M580 350 A230 230 0 0 1 1040 350"/><circle class="start-dot" cx="580" cy="350" r="4"/>' +
      icons.map(icon => `<g class="node"><circle class="pulse" r="26"/><g class="in"><circle class="ring" r="26"/><foreignObject x="-16" y="-16" width="32" height="32"><div xmlns="http://www.w3.org/1999/xhtml" class="node-media"><img class="node-image" src="${icon.src}" alt=""/></div></foreignObject></g></g>`).join("");
    hero.append(svg);

    const path = svg.querySelector(".arc");
    const dot = svg.querySelector(".start-dot");
    const nodes = Array.from(svg.querySelectorAll(".node"));
    const length = path.getTotalLength();
    const stops = pts.map((q, i) => {
      let best = 0, bestDist = Infinity;
      for (let l = 0; l <= length; l += 2) {
        const p = path.getPointAtLength(l);
        const dist = (p.x - q[0]) ** 2 + (p.y - q[1]) ** 2;
        if (dist < bestDist) { bestDist = dist; best = l; }
      }
      nodes[i].setAttribute("transform", `translate(${q[0]},${q[1]})`);
      nodes[i].style.setProperty("--d", `${i * 0.3}s`);
      return best / length;
    });
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    const opened = [];
    const duration = reduce ? 1 : 4200;
    let start = null;
    function tick(now) {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      path.style.strokeDashoffset = length * (1 - e);
      nodes.forEach((n, i) => {
        if (!opened[i] && e >= stops[i] - 0.015) { opened[i] = true; n.classList.add("on"); }
      });
      if (t < 1) requestAnimationFrame(tick);
    }
    setTimeout(() => {
      dot.classList.add("on");
      setTimeout(() => requestAnimationFrame(tick), 500);
    }, 600);
  })();
});

// Features section: tie the active feature and 3D artwork to page scroll.
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

// Devices section: accessible 3D carousel with wheel, drag, dots, and keyboard input.
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

// Devices and About sections: apply perspective as they enter and leave the viewport.
const panels = Array.from(document.querySelectorAll(".panel"));
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

// 3D testimonials: replace these clearly marked placeholders with approved client feedback.
(function () {
  const stage = document.querySelector("[data-testimonials3d]");
  if (!stage) return;

  const quote = stage.querySelector("[data-testimonials3d-quote]");
  const name = stage.querySelector("[data-testimonials3d-name]");
  const role = stage.querySelector("[data-testimonials3d-role]");
  const card = stage.querySelector(".testimonials3d__card");
  const dotsContainer = document.querySelector("[data-testimonials3d-dots]");
  const previousButton = document.querySelector("[data-testimonials3d-prev]");
  const nextButton = document.querySelector("[data-testimonials3d-next]");
  const testimonials = [
    {
      quote: "Add an approved customer quote about their security goals and experience.",
      name: "Client name",
      role: "Organization / role"
    },
    {
      quote: "Add a verified customer story about a solution delivered by Oyster Digital Security.",
      name: "Client name",
      role: "Organization / role"
    },
    {
      quote: "Add approved feedback about the customer's experience working with the team.",
      name: "Client name",
      role: "Organization / role"
    }
  ];
  let activeIndex = 0;
  let transitionId = 0;

  const dots = testimonials.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = "testimonials3d__dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.setAttribute("aria-pressed", "false");
    dot.addEventListener("click", () => showTestimonial(index));
    dotsContainer.append(dot);
    return dot;
  });

  function showTestimonial(index) {
    activeIndex = (index + testimonials.length) % testimonials.length;
    const currentTransition = ++transitionId;
    card.classList.add("is-changing");
    dots.forEach((dot, dotIndex) => {
      dot.setAttribute("aria-pressed", String(dotIndex === activeIndex));
    });

    window.setTimeout(() => {
      if (currentTransition !== transitionId) return;
      const testimonial = testimonials[activeIndex];
      quote.textContent = testimonial.quote;
      name.textContent = testimonial.name;
      role.textContent = testimonial.role;
      card.classList.remove("is-changing");
    }, 160);
  }

  previousButton.addEventListener("click", () => {
    showTestimonial(activeIndex - 1);
  });
  nextButton.addEventListener("click", () => {
    showTestimonial(activeIndex + 1);
  });
  stage.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showTestimonial(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showTestimonial(activeIndex + 1);
    }
  });
  stage.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const bounds = stage.getBoundingClientRect();
    const horizontalOffset = (event.clientX - bounds.left) / bounds.width - 0.5;
    const verticalOffset = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--testimonial-rotate-x", `${-verticalOffset * 7}deg`);
    card.style.setProperty("--testimonial-rotate-y", `${horizontalOffset * 7}deg`);
  });
  stage.addEventListener("pointerleave", () => {
    card.style.removeProperty("--testimonial-rotate-x");
    card.style.removeProperty("--testimonial-rotate-y");
  });

  showTestimonial(activeIndex);
})();


