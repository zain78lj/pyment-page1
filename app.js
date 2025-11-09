document.addEventListener('DOMContentLoaded', () => {
  const allCards = Array.from(document.querySelectorAll('.card.item'));
  const cart = new Map(); // key: name => {price, qty}
  const cartText = document.getElementById('cartText');
  const sendBtn = document.getElementById('sendBtn');
  const searchInput = document.getElementById('searchInput');
  const toTopBtn = document.getElementById('toTop');
  const customerPhone = document.getElementById('customerPhone');

  // --- التعامل مع البطاقات (الأكلات) ---
  allCards.forEach(card => {
    const name = card.dataset.name;
    const price = Number(card.dataset.price) || 0;
    const minus = card.querySelector('.qtyBtn.minus');
    const plus = card.querySelector('.qtyBtn.plus');
    const display = card.querySelector('.qtyDisplay');
    const addBtn = card.querySelector('.addBtn');

    plus.addEventListener('click', () => {
      const v = Math.max(0, Number(display.textContent || 0) + 1);
      display.textContent = v;
    });

    minus.addEventListener('click', () => {
      const v = Math.max(0, Number(display.textContent || 0) - 1);
      display.textContent = v;
    });

    addBtn.addEventListener('click', () => {
      const qty = Math.max(0, Number(display.textContent || 0));
      if (qty <= 0) {
        alert('حدد الكمية أولاً');
        return;
      }
      cart.set(name, { price, qty });
      card.classList.add('highlight');
      setTimeout(() => card.classList.remove('highlight'), 900);
      updateCartBar();
    });
  });
document.querySelectorAll('.card').forEach(card => {
  const addBtn = card.querySelector('.addBtn');
  const plusBtn = card.querySelector('.qtyBtn.plus');
  const minusBtn = card.querySelector('.qtyBtn.minus');
  const qtyDisplay = card.querySelector('.qtyDisplay');

  // إزالة أي مستمع قديم لمنع التكرار
  const newPlus = plusBtn.cloneNode(true);
  plusBtn.parentNode.replaceChild(newPlus, plusBtn);
  const newMinus = minusBtn.cloneNode(true);
  minusBtn.parentNode.replaceChild(newMinus, minusBtn);

  // تحديث المراجع بعد الاستبدال
  const plus = card.querySelector('.qtyBtn.plus');
  const minus = card.querySelector('.qtyBtn.minus');

  // زيادة واحدة فقط
  plus.addEventListener('click', () => {
    let qty = parseInt(qtyDisplay.textContent || "0", 10);
    qty = qty + 1;
    qtyDisplay.textContent = qty;
  });

  // إنقاص
  minus.addEventListener('click', () => {
    let qty = parseInt(qtyDisplay.textContent || "0", 10);
    if (qty > 0) qty -= 1;
    qtyDisplay.textContent = qty;
    if (qty === 0) {
      addBtn.classList.remove('added');
      addBtn.textContent = 'إضافة';
    }
  });

  // زر الإضافة
  addBtn.addEventListener('click', () => {
    const qty = parseInt(qtyDisplay.textContent || "0", 10);
    if (qty < 1) {
      addBtn.classList.add('shake');
      setTimeout(() => addBtn.classList.remove('shake'), 400);
      return;
    }
    addBtn.classList.add('added');
    addBtn.textContent = '✅ تمت الإضافة';
  });
});
  function updateCartBar() {
  if (cart.size === 0) {
    cartText.textContent = 'لم يتم اختيار شيء بعد';
    sendBtn.textContent = 'المجموع: 0 د.ع — إرسال الطلب عبر واتساب 📱';
    return;
  }

  let total = 0;
  const parts = [];
  for (const [name, info] of cart.entries()) {
    total += info.price * info.qty;
    parts.push(`${name} ×${info.qty}`);
  }

  cartText.textContent =$ `المجموع ${total.toLocaleString()} د.ع — ${parts.join('، ')}`;
  sendBtn.textContent =$ `المجموع: ${total.toLocaleString()} د.ع — إرسال الطلب عبر واتساب 📱`;
}

 // --- إرسال الطلب عبر واتساب ---
sendBtn.addEventListener('click', () => {
  if (cart.size === 0) {
    alert('الرجاء اختيار الأكلات أولاً');
    return;
  }

  let message = 'طلب جديد من مشويات وأجنحة أبو رحمة:\n\n';
  let total = 0;

  for (const [name, info] of cart.entries()) {
    message += `- ${name} ×${info.qty}\n`;
    total += info.price * info.qty;
  }

  message += `\nالمجموع: ${total.toLocaleString()} د.ع\n`;

  const phoneCustomer = (customerPhone && customerPhone.value.trim())
    ?`\nهاتف الزبون: ${customerPhone.value.trim()}\n`
    : '\n';

  message += phoneCustomer;
  message += `\nالعنوان:\nملاحظات:\n`;

  const phoneTarget = '9647774889440'; // رقم المطعم بدون +
  const encodedMessage = encodeURIComponent(message);

  // يفتح تطبيق واتساب مباشرة، وإذا ما نجح يفتح واتساب ويب
  const appURL = `whatsapp://send?phone=${phoneTarget}&text=${encodedMessage}`;
  const webURL = `https://wa.me/${phoneTarget}?text=${encodedMessage}`;

  window.location.href = appURL;
  setTimeout(() => {
    window.open(webURL, '_blank');
  }, 1500);
});

  // --- التنقل بين الأقسام ---
  window.scrollToSection = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const first = el.querySelector('.card.item');
    if (first) {
      first.classList.add('highlight');
      setTimeout(() => first.classList.remove('highlight'), 1200);
    }
  };

  // --- البحث المباشر ---
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return;
    const found = allCards.find(c =>
      (c.dataset.name && c.dataset.name.toLowerCase().includes(q)) ||
      (c.querySelector('.card-title') && c.querySelector('.card-title').innerText.toLowerCase().includes(q))
    );
    if (found) {
      found.scrollIntoView({ behavior: 'smooth', block: 'center' });
      found.classList.add('highlight');
      setTimeout(() => found.classList.remove('highlight'), 1400);
    }
  });

  // --- زر الرجوع للأعلى ---
  toTopBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  window.addEventListener('scroll', () => {
    toTopBtn.style.display = window.scrollY > 300 ? 'grid' : 'none';
  });
  toTopBtn.style.display = 'none';

  // --- معالجة الصور المكسورة ---
  document.querySelectorAll('.card-top img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const ph = img.parentNode.querySelector('.placeholder');
      if (ph) ph.style.display = 'grid';
    });
  });

  // --- تحديث أولي ---
  updateCartBar();
})
