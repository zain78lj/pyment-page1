/* ZainNet — Modal navigation and small interactions */
(() => {
  const backdrop = document.getElementById('modalBackdrop');
  const modal = backdrop.querySelector('.modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');
  const toast = document.getElementById('toast');
  let lastFocused = null;

  const sections = {
    prices: ['الاشتراكات والأسعار', 'ZAINNET • SUBSCRIPTION PLANS'],
    maintenance: ['الصيانة والدعم الفني', 'ZAINNET • TECHNICAL SUPPORT'],
    programs: ['البرامج و IPTV', 'ZAINNET • APPS & IPTV'],
    payments: ['التسديد الإلكتروني', 'ZAINNET • PAYMENT METHODS'],
    news: ['أخبار ومجموعة ZainNet', 'ZAINNET • COMMUNITY'],
    contact: ['تواصل معنا', 'ZAINNET • CONTACT']
  };

  function renderIcons(scope = document) {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ root: scope, attrs: { 'stroke-width': 1.8 } });
    }
  }

  function openModal(key) {
    const info = sections[key];
    const template = document.getElementById(`tpl-${key}`);
    if (!info || !template) return;
    lastFocused = document.activeElement;
    modalTitle.textContent = info[0];
    document.getElementById('modalKicker').textContent = info[1];
    modalContent.replaceChildren(template.content.cloneNode(true));
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderIcons(modalContent);
    modalClose.focus();
  }

  function closeModal() {
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalContent.replaceChildren();
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-open]');
    if (opener) openModal(opener.dataset.open);

    const copyButton = event.target.closest('[data-copy]');
    if (copyButton) copyText(copyButton.dataset.copy);

    const copyNumberButton = event.target.closest('.copy-number');
    if (copyNumberButton) copyText(copyNumberButton.dataset.copy);
  });

  modalClose.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && backdrop.classList.contains('active')) closeModal();
    if (event.key === 'Tab' && backdrop.classList.contains('active')) {
      const focusable = [...modal.querySelectorAll('a[href],button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });

  async function copyText(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const field = document.createElement('textarea');
        field.value = value;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const ok = document.execCommand('copy');
        field.remove();
        if (!ok) throw new Error('Copy failed');
      }
      showToast('تم نسخ البيانات');
    } catch {
      showToast('تعذر النسخ — يمكنك تحديد الرقم ونسخه يدوياً');
    }
  }

  let toastTimer;
  function showToast(message) {
    toast.querySelector('span').textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2100);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
  renderIcons();

  // Small-screen shortcut: open the contact section from the compact menu.
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.addEventListener('click', () => openModal('contact'));
})();