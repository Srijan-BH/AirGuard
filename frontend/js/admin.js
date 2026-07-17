// frontend/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Enforce Admin Authentication
    if(typeof protectRoute === 'function') {
        protectRoute(['Admin']); // Only Admins allowed here
    }

    // Shared chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 2000, easing: 'easeOutQuart' },
        scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        },
        plugins: {
            legend: { labels: { color: '#f8fafc' } }
        }
    };

    function createGradient(ctx, colorStart, colorEnd) {
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    }

    // Chart 1: Area Chart (Login Statistics)
    const ctxArea = document.getElementById('loginAreaChart').getContext('2d');
    new Chart(ctxArea, {
        type: 'line', // Area chart is a line chart with fill=true
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Unique Logins',
                data: [150, 180, 120, 200, 250, 220, 300],
                borderColor: '#10b981',
                backgroundColor: createGradient(ctxArea, 'rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0.0)'),
                borderWidth: 2, fill: true, tension: 0.4
            }]
        },
        options: commonOptions
    });

    // Chart 2: Bar Chart (Most Polluted Cities)
    const ctxBar = document.getElementById('pollutedBarChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Delhi', 'Lahore', 'Dhaka', 'Beijing', 'Jakarta'],
            datasets: [{
                label: 'Average AQI',
                data: [350, 310, 280, 220, 190],
                backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16'],
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
            }]
        },
        options: { ...commonOptions, scales: { x: commonOptions.scales.x, y: commonOptions.scales.y } }
    });

    // Chart 3: Line Chart (System AQI Trends)
    const ctxLine = document.getElementById('aqiAdminLineChart').getContext('2d');
    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'System-wide Avg AQI',
                data: [110, 115, 105, 120, 95, 90],
                borderColor: '#3b82f6',
                borderWidth: 3, fill: false, tension: 0.1,
                pointBackgroundColor: '#fff', pointRadius: 4
            }]
        },
        options: commonOptions
    });

    // Chart 4: Pie Chart (User Roles)
    const ctxPie = document.getElementById('userRolesPieChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Standard Users', 'Premium Users', 'Admins'],
            datasets: [{
                data: [850, 350, 45],
                backgroundColor: ['#3b82f6', '#8b5cf6', '#ef4444'],
                borderWidth: 0, hoverOffset: 10
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#f8fafc' } } }
        }
    });

    // --- User Management Logic ---
    let usersData = [
        { id: '1', name: 'Alice Smith', email: 'alice@example.com', role: 'User', date: '2025-01-15' },
        { id: '2', name: 'Bob Johnson', email: 'bob@example.com', role: 'Admin', date: '2024-11-02' },
        { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', date: '2025-02-20' },
        { id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'User', date: '2025-03-10' },
        { id: '5', name: 'Evan Wright', email: 'admin@airguard.ai', role: 'Admin', date: '2023-10-01' }
    ];

    const tableBody = document.getElementById('userTableBody');
    const searchInput = document.getElementById('userSearch');
    const roleFilter = document.getElementById('userFilter');

    function renderUsers() {
        tableBody.innerHTML = '';
        const query = searchInput.value.toLowerCase();
        const filter = roleFilter.value;

        const filteredUsers = usersData.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
            const matchesRole = filter === 'All' || user.role === filter;
            return matchesSearch && matchesRole;
        });

        filteredUsers.forEach(user => {
            const tr = document.createElement('tr');
            
            // Badge style for role
            let roleBadge = user.role === 'Admin' 
                ? `<span style="background: rgba(239,68,68,0.2); color: #ef4444; padding: 5px 10px; border-radius: 12px; font-size: 0.8rem; border: 1px solid #ef4444;">Admin</span>`
                : `<span style="background: rgba(59,130,246,0.2); color: #3b82f6; padding: 5px 10px; border-radius: 12px; font-size: 0.8rem; border: 1px solid #3b82f6;">User</span>`;

            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${roleBadge}</td>
                <td>${user.date}</td>
                <td>
                    <button class="btn-ripple" onclick="deleteUser('${user.id}')" style="background: var(--danger); padding: 8px 15px; font-size: 0.8rem;">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        
        if(filteredUsers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 20px;">No users found matching your criteria.</td></tr>`;
        }
    }

    // Attach Search and Filter Listeners
    searchInput.addEventListener('input', renderUsers);
    roleFilter.addEventListener('change', renderUsers);

    // Delete User Function globally exposed
    window.deleteUser = function(userId) {
        if(confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            // Simulate backend delete logic
            usersData = usersData.filter(u => u.id !== userId);
            renderUsers();
            showToast('User deleted successfully', 'success');
            
            // Update Top Stat
            const countEl = document.getElementById('statTotalUsers');
            let current = parseInt(countEl.innerText.replace(',', ''));
            countEl.innerText = (current - 1).toLocaleString();
        }
    };

    // Initial Table Render
    renderUsers();
});
