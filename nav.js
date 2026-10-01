(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  // Light / dark: follows the device unless the visitor picks one.
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-btn');
  var reset = document.getElementById('theme-reset');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var stored = function () { try { return localStorage.getItem('theme'); } catch (e) { return null; } };
  var effective = function () {
    var t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return mq && mq.matches ? 'dark' : 'light';
  };
  var paint = function () {
    if (!themeBtn) return;
    var dark = effective() === 'dark';
    themeBtn.classList.toggle('is-dark', dark);
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeBtn.title = themeBtn.getAttribute('aria-label');
    if (reset) reset.hidden = !stored();
  };
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = effective() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      paint();
    });
  }
  if (reset) {
    reset.addEventListener('click', function () {
      try { localStorage.removeItem('theme'); } catch (e) {}
      root.removeAttribute('data-theme');
      paint();
    });
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', paint);
  paint();

  var copy = document.getElementById('copy-email');
  if (copy) {
    copy.addEventListener('click', function () {
      var text = copy.getAttribute('data-copy');
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1800); };
      var fallback = function () {
        var r = document.createRange(); r.selectNodeContents(document.getElementById('email-addr'));
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        copy.textContent = 'Press Ctrl/⌘ + C';
      };
      try {
        navigator.clipboard.writeText(text).then(done, fallback);
      } catch (e) { fallback(); }
    });
  }
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('form-note');
      var btn = form.querySelector('button[type="submit"]');
      var fallback = form.getAttribute('data-fallback');
      var say = function (msg) { note.textContent = msg; note.hidden = false; };
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var endpoint = form.getAttribute('action');
      if (!endpoint) { say('This form isn’t connected yet. Please email ' + fallback + ' instead.'); return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('status ' + r.status);
          form.reset();
          say('Thanks, your message was sent. I’ll reply by email.');
        })
        .catch(function () {
          say('Your message couldn’t be sent just now. Please email ' + fallback + ' instead.');
        })
        .then(function () { btn.disabled = false; btn.textContent = 'Send message'; });
    });
  }
})();
