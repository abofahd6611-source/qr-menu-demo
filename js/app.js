(() => {

  // If packed image data is present (GitHub Pages without binary blobs), use it.
  const packed = window.MENU_IMAGES || {};
  document.querySelectorAll("img[src]").forEach((img) => {
    const key = img.getAttribute("src");
    if (packed[key]) img.src = packed[key];
  });
  const root = document.documentElement;
  const langBtn = document.getElementById("lang-toggle");
  const statusEl = document.getElementById("open-status");
  const modal = document.getElementById("wa-modal");
  const waOpeners = document.querySelectorAll("[data-open-wa]");
  const waClose = document.querySelectorAll("[data-close-wa]");

  const applyI18n = (lang) => {
    document.querySelectorAll("[data-ar][data-en]").forEach((el) => {
      const value = el.getAttribute(`data-${lang}`);
      if (value !== null) el.textContent = value;
    });
    document.querySelectorAll("[data-ar-aria][data-en-aria]").forEach((el) => {
      el.setAttribute("aria-label", el.getAttribute(`data-${lang}-aria`));
    });
    const title = document.querySelector("title");
    if (title && title.dataset.ar && title.dataset.en) {
      title.textContent = title.getAttribute(`data-${lang}`);
    }
  };

  const setLang = (lang) => {
    const next = lang === "en" ? "en" : "ar";
    root.lang = next;
    root.dir = next === "ar" ? "rtl" : "ltr";
    applyI18n(next);
    if (langBtn) {
      langBtn.setAttribute("aria-pressed", next === "en" ? "true" : "false");
    }
    try { localStorage.setItem("qr-menu-lang", next); } catch (_) {}
    updateHours();
  };

  const saved = (() => {
    try { return localStorage.getItem("qr-menu-lang"); } catch (_) { return null; }
  })();
  setLang(saved === "en" ? "en" : "ar");

  langBtn?.addEventListener("click", () => {
    setLang(root.lang === "ar" ? "en" : "ar");
  });

  // Opening hours in Asia/Riyadh: Sat–Thu 07:00–00:00, Friday 13:00–00:00
  function updateHours() {
    if (!statusEl) return;
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
    const day = now.getDay(); // 5 = Friday
    const minutes = now.getHours() * 60 + now.getMinutes();
    const openAt = day === 5 ? 13 * 60 : 7 * 60;
    const closeAt = 24 * 60;
    const isOpen = minutes >= openAt && minutes < closeAt;
    const lang = root.lang === "en" ? "en" : "ar";
    statusEl.classList.toggle("is-closed", !isOpen);
    statusEl.querySelector(".label").textContent = isOpen
      ? (lang === "ar" ? "مفتوح الآن" : "Open now")
      : (lang === "ar" ? "مغلق الآن" : "Closed now");
    statusEl.setAttribute("data-open", isOpen ? "1" : "0");
  }
  updateHours();
  setInterval(updateHours, 60000);

  // Sticky category highlighting
  const links = [...document.querySelectorAll(".cats a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
  };

  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => io.observe(s));
  }

  links.forEach((a) => {
    a.addEventListener("click", (ev) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      ev.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top, behavior: "smooth" });
      setActive(target.id);
    });
  });

  const openModal = () => {
    modal?.classList.add("is-open");
    modal?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    modal?.classList.remove("is-open");
    modal?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  waOpeners.forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); openModal(); }));
  waClose.forEach((el) => el.addEventListener("click", closeModal));
  modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
})();
