// admin-core.js - Handles SPA navigation, Chart rendering, and Simulated CRUD actions

const app = {
    showToast: window.showToast || function(msg) { alert(msg); },
    
    // Module Navigation
    initNavigation: function() {
        const links = document.querySelectorAll('.sidebar-link[data-target]');
        const sections = document.querySelectorAll('.module-section');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove active from all links and sections
                links.forEach(l => { l.classList.remove('active'); l.style.background = 'transparent'; l.style.borderColor = 'transparent'; l.style.color = '#fff'; });
                sections.forEach(s => s.classList.remove('active'));
                
                // Set active link style
                e.currentTarget.classList.add('active');
                e.currentTarget.style.background = 'rgba(0, 112, 243, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(0, 112, 243, 0.3)';
                e.currentTarget.style.color = '#0070f3';
                
                // Show target section
                const targetId = e.currentTarget.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
                
                // Initialize charts dynamically if not already done
                if (targetId === 'module-analytics' && !app.analyticsChartsRendered) {
                    app.renderAnalyticsCharts();
                    app.analyticsChartsRendered = true;
                }
                if (targetId === 'module-predictions' && !app.predictionChartRendered) {
                    app.renderPredictionChart();
                    app.predictionChartRendered = true;
                }
            });
        });
    },

    // User Management
    users: [],
    
    fetchUsers: async function() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/admin/users', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (res.ok) {
                this.users = await res.json();
                this.renderUsers();
                this.updateUserMetrics(); // Update dashboard metric when users load
            }
        } catch (err) {
            console.error("Failed to load users:", err);
        }
    },
    
    renderUsers: function() {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        this.users.forEach(u => {
            const statusBadge = u.status === 'Active' 
                ? '<span class="badge" style="background: rgba(0, 230, 118, 0.1); color: var(--success); border: 1px solid rgba(0, 230, 118, 0.3);">Active</span>'
                : '<span class="badge" style="background: rgba(238, 0, 0, 0.1); color: var(--danger); border: 1px solid rgba(238, 0, 0, 0.3);">Blocked</span>';
            
            const btnText = u.status === 'Active' ? 'Block' : 'Unblock';
            const btnColor = u.status === 'Active' ? 'var(--warning)' : 'var(--success)';
            
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #222;">
                    <td style="padding: 12px; font-family: monospace; color: #aaa; font-size: 0.75rem;">${u.id}</td>
                    <td style="padding: 12px;">
                        <div style="color: #fff; font-weight: 500;">${u.name}</div>
                        <div style="color: #666; font-size: 0.8rem;">${u.email}</div>
                    </td>
                    <td style="padding: 12px; color: #888;">${u.role}</td>
                    <td style="padding: 12px;">${statusBadge}</td>
                    <td style="padding: 12px; text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
                        <button class="btn-secondary" onclick="app.toggleUserStatus('${u.id}')" style="border-color: #333; padding: 4px 8px; font-size: 0.75rem; color: ${btnColor};">${btnText}</button>
                    </td>
                </tr>
            `;
        });
    },
    
    toggleUserStatus: function(id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            user.status = user.status === 'Active' ? 'Blocked' : 'Active';
            this.showToast(`User ${user.name} is now ${user.status}.`, user.status === 'Active' ? 'success' : 'warning');
            this.logAudit('USER_MGT', `Changed status of ${user.id} to ${user.status}`);
            this.renderUsers();
        }
    },

    // City Management
    cities: JSON.parse(localStorage.getItem('monitoredCities')) || ['Delhi, IN', 'Bangalore, IN', 'Mumbai, IN', 'Kolkata, IN', 'Chennai, IN'],
    renderCities: function() {
        const list = document.getElementById('cityList');
        if (!list) return;
        list.innerHTML = '';
        this.cities.forEach((c, idx) => {
            list.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #0a0a0a; border: 1px solid #222; border-radius: var(--radius-sm);">
                    <span style="color: #ccc; font-size: 0.9rem;">${c}</span>
                    <button class="btn-secondary" onclick="app.removeCity(${idx})" style="padding: 2px 6px; font-size: 0.7rem; border-color: #333; color: var(--danger);">Remove</button>
                </div>
            `;
        });
    },
    addCity: function() {
        const input = document.getElementById('newCityInput');
        if (input && input.value.trim() !== '') {
            this.cities.push(input.value.trim());
            localStorage.setItem('monitoredCities', JSON.stringify(this.cities));
            this.showToast(`${input.value} added to monitoring list.`, 'success');
            this.logAudit('LOCATION', `Added city: ${input.value}`);
            input.value = '';
            this.renderCities();
            const citiesEl = document.getElementById('metric-cities');
            if (citiesEl) citiesEl.innerText = this.cities.length.toString();
        }
    },
    removeCity: function(idx) {
        const removed = this.cities.splice(idx, 1)[0];
        localStorage.setItem('monitoredCities', JSON.stringify(this.cities));
        this.showToast(`${removed} tracking removed.`, 'info');
        this.logAudit('LOCATION', `Removed city: ${removed}`);
        this.renderCities();
        const citiesEl = document.getElementById('metric-cities');
        if (citiesEl) citiesEl.innerText = this.cities.length.toString();
    },

    // Simulated Settings Actions
    toggleMaintenance: function(isActive) {
        if (isActive) {
            this.showToast('⚠️ System entering Maintenance Mode.', 'warning');
            this.logAudit('SYSTEM', 'Enabled Maintenance Mode');
        } else {
            this.showToast('System is back online.', 'success');
            this.logAudit('SYSTEM', 'Disabled Maintenance Mode');
        }
    },
    
    sendBroadcast: function() {
        const msg = document.getElementById('broadcastMsg').value;
        if (msg) {
            this.showToast('Broadcast sent to all active users!', 'success');
            this.logAudit('NOTIFICATION', `Broadcast sent: "${msg.substring(0, 20)}..."`);
            document.getElementById('broadcastMsg').value = '';
        }
    },
    
    triggerBackup: function() {
        const prog = document.getElementById('backupProgress');
        const bar = document.getElementById('backupBar');
        prog.style.display = 'block';
        bar.style.width = '0%';
        
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 15;
            if (width >= 100) {
                width = 100;
                clearInterval(interval);
                setTimeout(() => {
                    prog.style.display = 'none';
                    this.showToast('Database Snapshot created securely.', 'success');
                    this.logAudit('BACKUP', 'Created full DB snapshot');
                }, 500);
            }
            bar.style.width = width + '%';
        }, 200);
    },

    logAudit: function(type, message) {
        const tbody = document.getElementById('auditLogBody');
        if (!tbody) return;
        const now = new Date();
        const time = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const html = `
            <tr style="border-bottom: 1px solid var(--border-subtle); animation: fadeIn 0.3s;">
                <td style="padding: 8px; color: var(--text-secondary);">${time}</td>
                <td style="padding: 8px; color: var(--accent-color);">${type}</td>
                <td style="padding: 8px; color: var(--text-muted);">${message}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('afterbegin', html);
    },

    // Dashboard Metrics
    updateUserMetrics: function() {
        const total = this.users.length;
        const active = this.users.filter(u => u.status === 'Active' || u.status === undefined || u.status === null).length; 
        const el = document.getElementById('metric-users');
        if (el) el.innerText = `${total.toLocaleString()} / ${active.toLocaleString()}`;
    },

    fetchDashboardMetrics: async function() {
        try {
            const token = localStorage.getItem('token');
            const start = performance.now();
            const res = await fetch('http://localhost:5000/admin/analytics', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const end = performance.now();
            
            if (res.ok) {
                const data = await res.json();
                
                // Predictions
                const predEl = document.getElementById('metric-predictions');
                if (predEl) predEl.innerText = (data.total_predictions || 0).toLocaleString();
                
                // Cities
                const citiesEl = document.getElementById('metric-cities');
                if (citiesEl) citiesEl.innerText = this.cities.length.toString();
                
                // Latency
                const latEl = document.getElementById('metric-latency');
                if (latEl) latEl.innerText = Math.round(end - start) + 'ms';
            }
        } catch (err) {
            console.error("Failed to load metrics:", err);
        }
    },

    // Charting Functions
    initDashboardChart: function() {
        if (typeof Chart === 'undefined') return;
        
        Chart.defaults.color = '#666';
        Chart.defaults.font.family = "'Inter', monospace";
        Chart.defaults.plugins.tooltip.backgroundColor = '#111';
        Chart.defaults.plugins.tooltip.borderColor = '#333';
        Chart.defaults.plugins.tooltip.borderWidth = 1;

        const ctx = document.getElementById('adminActivityChart');
        if (ctx) {
            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                    datasets: [{
                        label: 'Requests/min',
                        data: [120, 80, 450, 600, 550, 300],
                        borderColor: '#0070f3',
                        backgroundColor: 'rgba(0, 112, 243, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { x: { grid: { display: false, drawBorder: false } }, y: { grid: { color: '#222', drawBorder: false }, beginAtZero: true } },
                    plugins: { legend: { display: false } },
                    elements: { point: { radius: 0, hoverRadius: 6 } }
                }
            });
        }
    },

    renderPredictionChart: function() {
        const ctx = document.getElementById('predictionAccuracyChart');
        if (ctx) {
            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        { label: 'Predicted AQI', data: [45, 60, 55, 90, 120, 80, 65], borderColor: '#0070f3', tension: 0.4 },
                        { label: 'Actual Ground Truth', data: [42, 63, 52, 95, 118, 75, 68], borderColor: '#00e676', borderDash: [5, 5], tension: 0.4 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { x: { grid: { display: false, drawBorder: false } }, y: { grid: { color: '#222', drawBorder: false } } },
                    elements: { point: { radius: 0, hoverRadius: 6 } }
                }
            });
        }
    },

    renderAnalyticsCharts: async function() {
        const API_KEY = 'b101a416d62828bb317b839461ca5493';
        const labels = [];
        const aqiData = [];
        let totalPm25 = 0, totalPm10 = 0, totalO3 = 0, totalNo2 = 0, totalOther = 0;

        try {
            // Get up to top 5 monitored cities
            const citiesToFetch = this.cities.slice(0, 5);
            
            for (let city of citiesToFetch) {
                // 1. Get Lat/Lon
                const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
                const geoData = await geoRes.json();
                if(!geoData || geoData.length === 0) continue;
                
                const { lat, lon, name } = geoData[0];
                labels.push(name);
                
                // 2. Get Air Pollution
                const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
                const aqiJson = await aqiRes.json();
                const comps = aqiJson.list[0].components;
                
                // Calculate a rough proxy AQI for the bar chart (approximated for visual demo)
                const estimatedAQI = Math.min(500, Math.round((comps.pm2_5 * 4) + (comps.pm10 * 0.5))); 
                aqiData.push(estimatedAQI);
                
                totalPm25 += comps.pm2_5;
                totalPm10 += comps.pm10;
                totalO3 += comps.o3;
                totalNo2 += comps.no2;
                totalOther += (comps.co / 1000) + comps.so2; // CO is usually much higher in raw value, scale down
            }
            
            const ctx1 = document.getElementById('topRegionsChart');
            if (ctx1 && window.Chart) {
                new Chart(ctx1.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Live Estimated AQI',
                            data: aqiData,
                            backgroundColor: 'rgba(238, 0, 0, 0.2)',
                            borderColor: 'rgba(238, 0, 0, 0.8)',
                            borderWidth: 1,
                            borderRadius: 4
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { grid: { color: '#222' } } } }
                });
            }

            const ctx2 = document.getElementById('pollutantDistChart');
            if (ctx2 && window.Chart) {
                new Chart(ctx2.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['PM2.5', 'PM10', 'O3', 'NO2', 'Other'],
                        datasets: [{
                            data: [
                                Math.round(totalPm25), 
                                Math.round(totalPm10), 
                                Math.round(totalO3), 
                                Math.round(totalNo2), 
                                Math.round(totalOther)
                            ],
                            backgroundColor: ['#0070f3', '#8b5cf6', '#00e676', '#f5a623', '#333'],
                            borderWidth: 0
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '75%' }
                });
            }
        } catch(err) {
            console.error('Failed to fetch live analytics data:', err);
        }
    }
};

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    app.initNavigation();
    app.initDashboardChart();
    app.fetchUsers();
    app.renderCities();
    app.fetchDashboardMetrics();
    
    // Add some simulated log lines dynamically
    const terminal = document.getElementById('liveLogsTerminal');
    if (terminal) {
        setInterval(() => {
            const endpoints = ['GET /api/weather', 'POST /api/predict', 'GET /api/history', 'GET /health'];
            const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
            const div = document.createElement('div');
            const now = new Date();
            div.innerText = `[${now.toISOString().split('T')[0]} ${now.toLocaleTimeString()}] ${ep} 200 OK`;
            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight;
        }, 3000);
    }
});
