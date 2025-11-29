/* ============================================= */
/*               script.js - Main Scripts         */
/* ============================================= */

// Smooth Scroll + Close Mobile Menu on Link Click
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    const target = document.querySelector(href);
    const mobileMenu = document.getElementById('mobileMenu');
    if (target) {
      // account for fixed navbar height
      const nav = document.getElementById('main-nav');
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
      if (mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    }
  });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('main-nav');
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile Menu Toggle
document.querySelector('.navbar-toggler').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('active');
  document.body.style.overflow = 'hidden';
});

// Close Mobile Menu Button
document.getElementById('closeMobileMenu').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.remove('active');
  document.body.style.overflow = 'auto';
});

// Close Mobile Menu When Clicking Outside
document.getElementById('mobileMenu').addEventListener('click', (e) => {
  if (e.target === document.getElementById('mobileMenu')) {
    document.getElementById('mobileMenu').classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

// Contact Form Handler for Web3Forms
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const btn = this.querySelector('button[type="submit"]');
  const originalText = btn.innerText;
  btn.innerText = 'Sending...';
  btn.disabled = true;
  
  const formData = new FormData(this);
  
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showToast('✓ Message sent successfully! I will get back to you soon.');
      document.getElementById('contactForm').reset();
    } else {
      showToast('✗ Error: ' + (data.message || 'Failed to send message'), true);
    }
    btn.innerText = originalText;
    btn.disabled = false;
  })
  .catch(error => {
    console.error('Error:', error);
    showToast('✗ Error sending message. Please try again.', true);
    btn.innerText = originalText;
    btn.disabled = false;
  });
});

// (Scroll/entrance animations removed — keeping other functionality.)

/* Lightweight Typewriter for hero roles (low overhead) */
(function(){
  const roles = ['AI Engineer', 'Graphic Designer', 'Frontend Developer'];
  const el = document.getElementById('role-type');
  if (!el) return;

  // start with empty content so typing effect is visible immediately
  el.textContent = '';

  let roleIdx = 0, charIdx = 0, forward = true;
  const typeSpeed = 90; // ms per character
  const holdDelay = 1200; // hold full word

  function tick(){
    const current = roles[roleIdx];
    if (forward) {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        forward = false;
        setTimeout(tick, holdDelay);
        return;
      }
    } else {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        forward = true;
        roleIdx = (roleIdx + 1) % roles.length;
      }
    }
    setTimeout(tick, forward ? typeSpeed : typeSpeed/1.8);
  }

  // start after a short delay so page settles
  setTimeout(tick, 400);
})();

/* Chatbot playground removed (Python editor and local robot interactions were removed) */

/* Toast helper for in-page messages */
function showToast(message, isError=false, duration=4000) {
  const el = document.getElementById('toast');
  if (!el) {
    alert(message);
    return;
  }
  el.textContent = message;
  if (isError) {
    el.style.background = 'linear-gradient(90deg, rgba(220,38,38,0.95), rgba(139,92,246,0.9))';
  } else {
    el.style.background = 'linear-gradient(90deg, rgba(16,185,129,0.95), rgba(59,130,246,0.9))';
  }
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

/* Active nav highlighting using IntersectionObserver */
(function(){
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector('.nav-links a[href="#' + id + '"]');
      if (entry.isIntersecting) {
        navLinks.forEach(n => n.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  }, { root: null, threshold: 0.45 });

  sections.forEach(s => observer.observe(s));
})();

/* Sticky chat button & widget behavior: send user message to backend */
document.addEventListener('DOMContentLoaded', function(){
  // Helper function to escape HTML and prevent XSS
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  const CHAT_CONFIG = {
    endpoint: 'https://f4a727dd-945a-42b6-95dd-98a2d5b4fe72-00-1m85tntpt7yo6.pike.replit.dev/ask', // Replit backend endpoint
    apiKey: null // optional API key if your backend requires one
  };

  const botBtn = document.getElementById('chatBotButton');
  const widget = document.getElementById('chatWidget');
  const closeBtn = document.getElementById('chatClose');
  const body = document.getElementById('chatBody');
  const input = document.getElementById('chatWidgetInput');
  const send = document.getElementById('chatWidgetSend');

  if (!botBtn || !widget) {
    console.error('Chat elements not found');
    return;
  }

  function openWidget(){
    widget.classList.add('open');
    widget.setAttribute('aria-hidden','false');
    botBtn.style.transform = 'scale(0.95)';
    setTimeout(()=> botBtn.style.transform = '', 120);
    // if first open, send initial prompt to backend to say hello or ask about Hussain
    if (!widget._openedBefore) {
      widget._openedBefore = true;
      appendChat("Hello! Ask me anything about Hussain — I can introduce his experience, skills and projects.", 'bot');
      // focus the input for convenience
      setTimeout(() => { input.focus(); }, 120);
    }
  }

  function closeWidget(){
    widget.classList.remove('open');
    widget.setAttribute('aria-hidden','true');
  }

  function appendChat(text, who='bot'){
    const el = document.createElement('div');
    el.className = 'chat-msg ' + (who === 'user' ? 'user' : 'bot');
    el.innerHTML = escapeHtml(text);
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  botBtn.addEventListener('click', openWidget);
  closeBtn?.addEventListener('click', closeWidget);

  // expression on hover / touch: change robot expression when user hovers or taps
  const robotIcon = botBtn.querySelector('.robot-icon');
  if (robotIcon) {
    botBtn.addEventListener('mouseenter', () => {
      robotIcon.classList.add('happy');
    });
    botBtn.addEventListener('mouseleave', () => {
      robotIcon.classList.remove('happy');
    });
    // touch devices: toggle happy briefly on touchstart
    botBtn.addEventListener('touchstart', (e) => {
      robotIcon.classList.add('happy');
      setTimeout(() => robotIcon.classList.remove('happy'), 900);
    }, { passive: true });
  }

  // send message to backend
  async function sendMessage(){
    const text = (input.value || '').trim();
    if (!text) return;

    // append user message and clear input
    appendChat(text, 'user');
    input.value = '';
    send.disabled = true;

    // thinking placeholder (kept as HTML) and UI animation
    const thinkingEl = document.createElement('div');
    thinkingEl.className = 'chat-msg bot';
    thinkingEl.innerHTML = '<em>Thinking...</em>';
    body.appendChild(thinkingEl);
    body.scrollTop = body.scrollHeight;

    const robotIcon = botBtn.querySelector('.robot-icon');
    if (robotIcon) { robotIcon.classList.add('thinking'); robotIcon.classList.add('bop'); }

    try {
      const res = await fetch("https://f4a727dd-945a-42b6-95dd-98a2d5b4fe72-00-1m85tntpt7yo6.pike.replit.dev/ask", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ q: text })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const reply = json.reply || "I'm here to help! Ask me anything about Hussain.";

      // replace thinking placeholder with bot reply
      thinkingEl.innerHTML = escapeHtml(reply);
      body.scrollTop = body.scrollHeight;

      if (robotIcon) {
        robotIcon.classList.remove('thinking');
        robotIcon.classList.add('happy');
        setTimeout(()=> robotIcon.classList.remove('happy'), 2500);
        robotIcon.classList.remove('bop');
      }
    } catch (e) {
      console.error('Chat error', e);
      thinkingEl.innerHTML = 'Oops, try again!';
      thinkingEl.classList.add('error');
      if (robotIcon) robotIcon.classList.remove('thinking', 'bop');
      showToast('Chat error: ' + e.message, true);
    } finally {
      send.disabled = false;
      input.focus();
    }
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

});