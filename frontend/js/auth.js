// auth.js

// 1. Password Strength Meter Logic
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[@$!%*?&]/)) strength++;
    return strength; // Returns 0 to 5
}

// 2. Real-Time Validation for Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    const pwdInput = document.getElementById('password');
    const confirmPwdInput = document.getElementById('confirmPassword');
    const strengthMeter = document.getElementById('strengthMeter');
    
    // Listen for password input to update meter
    pwdInput.addEventListener('input', function() {
        const val = this.value;
        const strength = checkPasswordStrength(val);
        const colors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];
        
        if (val.length === 0) {
            strengthMeter.style.width = '0%';
            strengthMeter.style.backgroundColor = 'transparent';
        } else {
            strengthMeter.style.width = `${(strength / 5) * 100}%`;
            strengthMeter.style.backgroundColor = colors[strength - 1] || colors[0];
        }
    });

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const password = pwdInput.value;
        const confirmPassword = confirmPwdInput.value;
        
        // Capture Name and Email from the updated signup form IDs
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        if (nameInput && emailInput) {
            // Save to mock database
            const usersDb = JSON.parse(localStorage.getItem('usersDb') || '{}');
            usersDb[emailInput.value.toLowerCase()] = nameInput.value;
            localStorage.setItem('usersDb', JSON.stringify(usersDb));
            
            // Set active session
            localStorage.setItem('userName', nameInput.value);
            localStorage.setItem('userEmail', emailInput.value);
        }

        // Confirm Password Validation
        if (password !== confirmPassword) {
            showToast('Passwords do not match!', 'error');
            return;
        }

        // Enforce strong password rules
        if (checkPasswordStrength(password) < 5) {
            showToast('Password is too weak. Must contain 8+ chars, uppercase, lowercase, number, and special character.', 'warning');
            return;
        }

        showToast('Account created successfully!', 'success');
        // Simulated Redirect
        setTimeout(() => window.location.href = 'login.html', 1500);
    });
}

// 3. Login Logic with Role-Based Redirect
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;

        try {
            showToast('Authenticating...', 'info');
            
            // Simulating API integration
            setTimeout(() => {
                const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.signature";
                // Mock Role logic based on email for demonstration
                let role = "User";
                if (email.toLowerCase().includes("admin")) role = "Admin";
                
                // Store JWT and Role securely in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                
                // --- NEW: Store Profile Info ---
                localStorage.setItem('userEmail', email);
                
                // Lookup name from mock database
                const usersDb = JSON.parse(localStorage.getItem('usersDb') || '{}');
                let activeName = usersDb[email.toLowerCase()];
                
                if (!activeName) {
                    // Generate a mock name from the email if not found in DB
                    activeName = email.split('@')[0].replace(/[\._]/g, ' ');
                    activeName = activeName.replace(/\b\w/g, c => c.toUpperCase());
                }
                
                // Set active session name
                localStorage.setItem('userName', activeName);
                // -------------------------------
                
                showToast(`Welcome back, ${activeName}!`, 'success');
                
                // Redirect Logic
                if (role === 'Admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
        } catch(err) {
            showToast(err.message, 'error');
        }
    });
}

// 4. Protected Routes & Session Expiry Logic
function protectRoute(allowedRoles = []) {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Check if token exists
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Role Based Access Control
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        showToast('Unauthorized access!', 'error');
        setTimeout(() => {
            if(role === 'Admin') window.location.href = 'admin.html';
            else window.location.href = 'dashboard.html';
        }, 1500);
    }
}
