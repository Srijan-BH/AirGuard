// frontend/js/smog-simulation.js

let smogAnimFrame;
let particles = [];
let canvas;
let ctx;

function initSmogCanvas() {
    if (!document.getElementById('smogCanvas')) {
        canvas = document.createElement('canvas');
        canvas.id = 'smogCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0'; // Keep it behind panels
        canvas.style.opacity = '0'; 
        canvas.style.transition = 'opacity 2s ease-in-out';
        document.body.insertBefore(canvas, document.body.firstChild);
        
        ctx = canvas.getContext('2d');
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

function startSmogSimulation(aqi) {
    initSmogCanvas();
    
    // Stop any existing animation
    if (smogAnimFrame) cancelAnimationFrame(smogAnimFrame);
    particles = [];
    
    let particleCount = 0;
    // We use rgba arrays to easily build gradients later
    let r=200, g=200, b=200, a=0.1; 
    let speedMultiplier = 1;
    let sizeMultiplier = 1;
    
    if (aqi <= 100) {
        canvas.style.opacity = '0';
        return;
    } else if (aqi <= 200) {
        particleCount = 15;
        r=180; g=170; b=150; a=0.15; // Light dust
        sizeMultiplier = 1;
        speedMultiplier = 0.5;
    } else if (aqi <= 300) {
        particleCount = 30;
        r=150; g=120; b=90; a=0.25; // Brown smog
        sizeMultiplier = 1.5;
        speedMultiplier = 1;
    } else {
        particleCount = 50;
        r=100; g=70; b=50; a=0.4; // Toxic dense smog
        sizeMultiplier = 2.5;
        speedMultiplier = 1.5;
    }
    
    canvas.style.opacity = '1';

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: (Math.random() * 150 + 100) * sizeMultiplier, // Very large clouds
            vx: (Math.random() * 1.5 + 0.5) * speedMultiplier, // Mostly moving right
            vy: (Math.random() - 0.5) * 0.5 * speedMultiplier, // Slight vertical drift
            r: r, g: g, b: b, a: a
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            // Seamless wrap
            if (p.x - p.radius > canvas.width) p.x = -p.radius;
            if (p.y - p.radius > canvas.height) p.y = -p.radius;
            if (p.y + p.radius < 0) p.y = canvas.height + p.radius;
            
            // Draw radial gradient for soft cloud look
            let gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            gradient.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.a})`);
            gradient.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });
        
        smogAnimFrame = requestAnimationFrame(animate);
    }
    
    animate();
}
