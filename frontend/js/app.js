// Theme Management via localStorage
const themeToggle = document.getElementById('theme-toggle');
// Default to light theme for presentations, unless explicitly set to dark
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// =============================================
// LOGOUT — clears session and redirects to login
// =============================================
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
};

// Ripple Effect
document.querySelectorAll('.btn-ripple').forEach(btn => {
    btn.addEventListener('click', function(e) {
        let x = e.clientX - e.target.getBoundingClientRect().left;
        let y = e.clientY - e.target.getBoundingClientRect().top;
        let ripples = document.createElement('span');
        ripples.style.left = x + 'px';
        ripples.style.top = y + 'px';
        ripples.classList.add('ripple');
        this.appendChild(ripples);
        setTimeout(() => { ripples.remove() }, 600);
    });
});

// Toast Notifications
window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast glass-panel`;
    if(type === 'success') toast.style.borderLeftColor = 'var(--success)';
    if(type === 'error') toast.style.borderLeftColor = 'var(--danger)';
    if(type === 'warning') toast.style.borderLeftColor = 'var(--warning)';
    toast.innerText = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Typing Animation
const typingElement = document.querySelector('.typing-text');
if (typingElement) {
    const text = typingElement.getAttribute('data-text');
    let i = 0;
    typingElement.innerText = '';
    function typeWriter() {
        if (i < text.length) {
            typingElement.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }
    typeWriter();
}

// Animated Counters
const counters = document.querySelectorAll('.counter');
counters.forEach(counter => {
    counter.innerText = '0';
    const updateCounter = () => {
        const target = +counter.getAttribute('data-target');
        const c = +counter.innerText;
        const increment = target / 200;
        if (c < target) {
            counter.innerText = `${Math.ceil(c + increment)}`;
            setTimeout(updateCounter, 10);
        } else {
            counter.innerText = target;
        }
    };
    updateCounter();
});

// Particles JS Init fallback
if(document.getElementById('particles-js') && window.particlesJS) {
    particlesJS("particles-js", {
        particles: { 
            number: { value: 60 }, 
            color: { value: "#ffffff" }, 
            shape: { type: "circle" }, 
            opacity: { value: 0.3 }, 
            size: { value: 3 }, 
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.2, width: 1 }, 
            move: { enable: true, speed: 1.5 } 
        },
        interactivity: { 
            detect_on: "canvas", 
            events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } } 
        },
        retina_detect: true
    });
}
