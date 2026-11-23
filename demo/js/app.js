(() => {
  const DATA_URL = "data/menu.json";
  const packed = window.MENU_IMAGES || {};

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const applyPackedImages = (root = document) => {
    root.querySelectorAll("img[src]").forEach((img) => {
      const key = img.getAttribute("src");
      if (packed[key]) img.src = packed[key];
    });
  };

  const applyTheme = (theme = {}) => {
    const map = {
      paper: "--paper",
      paper_2: "--paper-2",
      foam: "--foam",
      ink: "--ink",
      ink_2: "--ink-2",
      ink_3: "--ink-3",
      coffee: "--coffee",
      coffee_deep: "--coffee-deep",
      gold: "--gold",
      gold_2: "--gold-2",
      whatsapp: "--wa",
    };
    const root = document.documentElement;
    Object.entries(map).forEach(([k, cssVar]) => {
      if (theme[k]) root.style.setProperty(cssVar, theme[k]);
    });
    if (theme.coffee_deep) {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", theme.coffee_deep);
    }
  };

  const t = (lang, ar, en) => (lang === "en" ? en : ar);

  const escapeHtml = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const dataAttrs = (ar, en) =>
    `data-ar="${escapeHtml(ar)}" data-en="${escapeHtml(en)}"`;

  const parseHM = (hhmm) => {
    const [h, m] = String(hhmm).split(":").map((n) => parseInt(n, 10));
    return (h * 60) + (m || 0);
  };

  const isOpenNow = (hours) => {
    const tz = hours.timezone || "Asia/Riyadh";
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const rule = (hours.weekly || []).find((r) => r.days.includes(day));
    if (!rule) return false;
    const openAt = parseHM(rule.open);
    let closeAt = parseHM(rule.close);
    if (closeAt === 0 || closeAt === 24 * 60) closeAt = 24 * 60;
    return minutes >= openAt && minutes < closeAt;
  };

  const render = (data) => {
    const ui = data.ui || {};
    const brand = data.brand || {};
    const hero = data.hero || {};
    const banner = data.banner || {};
    const hours = data.hours || {};
    const loc = data.location || {};
    const wa = data.whatsapp || {};
    const footer = data.footer || {};
    const meta = data.meta || {};
    const cats = data.categories || [];

    const title = document.querySelector("title");
    if (title) {
      title.setAttribute("data-ar", meta.title_ar || "");
      title.setAttribute("data-en", meta.title_en || "");
    }
    const desc = document.querySelector('meta[name="description"]');
    if (desc && meta.description_ar) desc.setAttribute("content", meta.description_ar);

    const mount = document.getElementById("app");
    if (!mount) return;

    const catLinks = cats
      .map((c, i) => `<a href="#${escapeHtml(c.id)}" class="${i === 0 ? "is-active" : ""}" ${dataAttrs(c.name_ar, c.name_en)}>${escapeHtml(c.name_ar)}</a>`)
      .join("");

    const sections = cats
      .map((c) => {
        const items = (c.items || [])
          .map((item, idx) => {
            const eager = c === cats[0] && idx === 0 ? "eager" : "lazy";
            const kcal = item.kcal_ar
              ? `<span class="kcal"><span ${dataAttrs(item.kcal_ar, item.kcal_en || "")}>${escapeHtml(item.kcal_ar)}</span></span>`
              : "";
            const tag = item.tag_ar
              ? `<span class="tag" ${dataAttrs(item.tag_ar, item.tag_en || "")}>${escapeHtml(item.tag_ar)}</span>`
              : "";
            return `
        <article class="item">
          <img src="${escapeHtml(item.image || "")}" alt="" width="720" height="720" loading="${eager}">
          <div class="item-body">
            <h3 ${dataAttrs(item.name_ar, item.name_en)}>${escapeHtml(item.name_ar)}</h3>
            <p ${dataAttrs(item.desc_ar, item.desc_en)}>${escapeHtml(item.desc_ar)}</p>
            <div class="meta">${kcal}${tag}</div>
          </div>
          <div class="price">${escapeHtml(item.price)}<span class="unit" ${dataAttrs(ui.currency_ar || "ر.س", ui.currency_en || "SAR")}>${escapeHtml(ui.currency_ar || "ر.س")}</span></div>
        </article>`;
          })
          .join("");
        return `
      <section class="section" id="${escapeHtml(c.id)}">
        <h2 ${dataAttrs(c.name_ar, c.name_en)}>${escapeHtml(c.name_ar)}</h2>
        ${items}
      </section>`;
      })
      .join("\n");

    const hourLines = (hours.lines || [])
      .map((l) => `<div ${dataAttrs(l.ar, l.en)}>${escapeHtml(l.ar)}</div>`)
      .join("");

    const bannerHtml = data.demo && banner.ar
      ? `<div class="demo-banner" ${dataAttrs(banner.ar, banner.en)}>${escapeHtml(banner.ar)}</div>`
      : "";

    const waNumber = String(wa.number || "").replace(/\D/g, "");
    const waText = encodeURIComponent(wa.prefill_ar || "");
    const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : `https://wa.me/?text=${waText}`;

    const modal = data.demo || !waNumber
      ? `
  <div class="modal-backdrop" id="wa-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="wa-title">
    <div class="modal">
      <div class="grab" aria-hidden="true"></div>
      <h3 id="wa-title" ${dataAttrs(wa.demo_modal_title_ar, wa.demo_modal_title_en)}>${escapeHtml(wa.demo_modal_title_ar || "")}</h3>
      <p ${dataAttrs(wa.demo_modal_body_ar, wa.demo_modal_body_en)}>${escapeHtml(wa.demo_modal_body_ar || "")}</p>
      <div class="modal-actions">
        <a class="btn-wa" href="${waHref}" target="_blank" rel="noopener noreferrer" ${dataAttrs(wa.demo_modal_cta_ar, wa.demo_modal_cta_en)}>${escapeHtml(wa.demo_modal_cta_ar || "")}</a>
        <button type="button" class="btn-ghost" data-close-wa ${dataAttrs(wa.close_ar || "إغلاق", wa.close_en || "Close")}>${escapeHtml(wa.close_ar || "إغلاق")}</button>
      </div>
    </div>
  </div>`
      : "";

    mount.innerHTML = `
  ${bannerHtml}
  <header class="topbar">
    <a class="brand" href="#top" id="top">
      <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="${escapeHtml((data.theme || {}).coffee || "#4A2C1C")}"/>
        <path fill="${escapeHtml((data.theme || {}).gold || "#C4A06A")}" d="M18 28h22c0 8-5 16-11 16s-11-8-11-16zm22 2h3.5c3 0 5 2.2 5 5s-2 5-5 5H40"/>
        <rect x="22" y="48" width="16" height="3" rx="1.5" fill="#E8E0D2"/>
      </svg>
      <span class="brand-name">
        <span ${dataAttrs(brand.name_ar, brand.name_en)}>${escapeHtml(brand.name_ar)}</span>
        <small>${escapeHtml(brand.tagline_ar || "")}</small>
      </span>
    </a>
    <button type="button" class="lang-toggle" id="lang-toggle" aria-pressed="false" ${dataAttrs(ui.lang_to_en || "English", ui.lang_to_ar || "العربية")} data-ar-aria="Switch to English" data-en-aria="التبديل إلى العربية">${escapeHtml(ui.lang_to_en || "English")}</button>
  </header>

  <section class="hero">
    <img class="hero-bg" src="${escapeHtml(hero.image || "")}" alt="" width="1200" height="1500">
    <div>
      <span class="hero-kicker" ${dataAttrs(hero.kicker_ar, hero.kicker_en)}>${escapeHtml(hero.kicker_ar)}</span>
      <h1 ${dataAttrs(brand.legal_ar, brand.legal_en)}>${escapeHtml(brand.legal_ar)}</h1>
      <p class="subname">${escapeHtml(brand.subname || "")}</p>
      <p class="lead" ${dataAttrs(hero.lead_ar, hero.lead_en)}>${escapeHtml(hero.lead_ar)}</p>
    </div>
  </section>

  <nav class="cats" aria-label="${escapeHtml(ui.cats_aria_ar || "")}">
    <div class="cats-row">${catLinks}</div>
  </nav>

  <main>${sections}</main>

  <section class="info" id="visit" aria-labelledby="visit-title">
    <h2 id="visit-title" ${dataAttrs(ui.visit_ar, ui.visit_en)}>${escapeHtml(ui.visit_ar)}</h2>
    <div class="info-row">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
      <div>
        <div>
          <strong ${dataAttrs(hours.label_ar, hours.label_en)}>${escapeHtml(hours.label_ar)}</strong>
          <span class="status" id="open-status"><span class="dot"></span><span class="label"></span></span>
        </div>
        ${hourLines}
      </div>
    </div>
    <div class="info-row">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.2"/></svg>
      <div>
        <strong ${dataAttrs(loc.label_ar, loc.label_en)}>${escapeHtml(loc.label_ar)}</strong>
        <div ${dataAttrs(loc.address_ar, loc.address_en)}>${escapeHtml(loc.address_ar)}</div>
        <a href="${escapeHtml(loc.maps_url || "#")}" target="_blank" rel="noopener noreferrer" ${dataAttrs(loc.link_ar, loc.link_en)}>${escapeHtml(loc.link_ar)}</a>
      </div>
    </div>
  </section>

  <footer class="site-footer">
    <p><strong ${dataAttrs(footer.line1_ar, footer.line1_en)}>${escapeHtml(footer.line1_ar)}</strong></p>
    <p ${dataAttrs(footer.line2_ar, footer.line2_en)}>${escapeHtml(footer.line2_ar)}</p>
    <p ${dataAttrs(footer.line3_ar, footer.line3_en)}>${escapeHtml(footer.line3_ar)}</p>
  </footer>
`;

    // WhatsApp bar is fixed outside .app in original; keep same structure
    const existingBar = document.querySelector(".wa-bar");
    if (existingBar) existingBar.remove();
    const existingModal = document.querySelector("#wa-modal");
    if (existingModal) existingModal.remove();

    const bar = document.createElement("button");
    bar.type = "button";
    bar.className = "wa-bar";
    bar.setAttribute("data-open-wa", "");
    bar.setAttribute("data-ar-aria", "طلب أو تواصل عبر واتساب");
    bar.setAttribute("data-en-aria", "Order or contact via WhatsApp");
    bar.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.8L2 22l4.3-1.1A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5zM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-2.6.7.7-2.5-.2-.3A9 9 0 1 1 12 21zm5-6.7c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6 0a7.3 7.3 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.3-.3.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.6 11.4 11.4 0 0 0 4.4 3.9 5 5 0 0 0 2.3.7 2.8 2.8 0 0 0 1.8-.6 2.3 2.3 0 0 0 .5-1.6c0-.2 0-.3-.2-.4z"/></svg>
    <span ${dataAttrs(wa.button_ar, wa.button_en)}>${escapeHtml(wa.button_ar)}</span>`;
    document.body.appendChild(bar);
    if (modal) document.body.insertAdjacentHTML("beforeend", modal);

    applyPackedImages(document);
    bind(data);
  };

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
    const nav = document.querySelector(".cats");
    const uiLang = lang;
    if (nav) {
      const aria = uiLang === "en" ? (nav.getAttribute("data-en-aria") || nav.getAttribute("aria-label")) : nav.getAttribute("aria-label");
    }
  };

  function bind(data) {
    const root = document.documentElement;
    const langBtn = document.getElementById("lang-toggle");
    const statusEl = document.getElementById("open-status");
    const modal = document.getElementById("wa-modal");
    const waOpeners = document.querySelectorAll("[data-open-wa]");
    const waClose = document.querySelectorAll("[data-close-wa]");
    const hours = data.hours || {};
    const wa = data.whatsapp || {};
    const waNumber = String(wa.number || "").replace(/\D/g, "");
    const useModal = data.demo || !waNumber;

    const updateHours = () => {
      if (!statusEl) return;
      const lang = root.lang === "en" ? "en" : "ar";
      const open = isOpenNow(hours);
      statusEl.classList.toggle("is-closed", !open);
      statusEl.setAttribute("data-open", open ? "1" : "0");
      const label = statusEl.querySelector(".label");
      if (label) {
        label.textContent = open
          ? (lang === "ar" ? hours.open_ar || "مفتوح الآن" : hours.open_en || "Open now")
          : (lang === "ar" ? hours.closed_ar || "مغلق الآن" : hours.closed_en || "Closed now");
      }
    };

    const setLang = (lang) => {
      const next = lang === "en" ? "en" : "ar";
      root.lang = next;
      root.dir = next === "ar" ? "rtl" : "ltr";
      applyI18n(next);
      if (langBtn) langBtn.setAttribute("aria-pressed", next === "en" ? "true" : "false");
      try { localStorage.setItem("qr-menu-lang", next); } catch (_) {}
      updateHours();
    };

    const saved = (() => {
      try { return localStorage.getItem("qr-menu-lang"); } catch (_) { return null; }
    })();
    setLang(saved === "en" ? "en" : (data.locale_default || "ar"));

    langBtn?.addEventListener("click", () => {
      setLang(root.lang === "ar" ? "en" : "ar");
    });

    updateHours();
    setInterval(updateHours, 60000);

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

    waOpeners.forEach((el) =>
      el.addEventListener("click", (e) => {
        if (useModal) {
          e.preventDefault();
          openModal();
        } else {
          const text = encodeURIComponent(
            (root.lang === "en" ? wa.prefill_en : wa.prefill_ar) || ""
          );
          window.open(`https://wa.me/${waNumber}?text=${text}`, "_blank", "noopener,noreferrer");
        }
      })
    );
    waClose.forEach((el) => el.addEventListener("click", closeModal));
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  const boot = async () => {
    try {
      const res = await fetch(DATA_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error("menu.json " + res.status);
      const data = await res.json();
      applyTheme(data.theme || {});
      render(data);
    } catch (err) {
      const mount = document.getElementById("app");
      if (mount) {
        mount.innerHTML = `<div class="demo-banner">تعذّر تحميل بيانات المنيو (data/menu.json). افتح الصفحة عبر خادم محلي وليس كملف مباشر.</div>`;
      }
      console.error(err);
    }
  };

  boot();
})();
