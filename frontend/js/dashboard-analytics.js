// frontend/js/dashboard-analytics.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Enforce Authentication Logic (using protectRoute from auth.js)
    if(typeof protectRoute === 'function') {
        protectRoute(); 
    }

    // Shared chart options for animations and glass aesthetics
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 2000,
            easing: 'easeOutQuart'
        },
        scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' }, beginAtZero: true },
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        },
        plugins: {
            legend: { labels: { color: '#f8fafc', font: { family: 'Inter' } } },
            tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#fff', bodyColor: '#cbd5e1' }
        }
    };

    // Helper to create gradient fills
    function createGradient(ctx, colorStart, colorEnd) {
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    }

    // 1. AQI Trend Line Chart
    const ctxAqi = document.getElementById('aqiTrendChart').getContext('2d');
    const aqiChart = new Chart(ctxAqi, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'AQI',
                data: [42, 45, 60, 55, 85, 120, 90],
                borderColor: '#3b82f6',
                backgroundColor: createGradient(ctxAqi, 'rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 0.0)'),
                borderWidth: 3, fill: true, tension: 0.4,
                pointBackgroundColor: '#fff', pointBorderColor: '#3b82f6', pointBorderWidth: 2, pointRadius: 4
            }]
        },
        options: commonOptions
    });

    // 2. Pollutant Bar Chart
    const ctxPollutant = document.getElementById('pollutantBarChart').getContext('2d');
    const pollutantChart = new Chart(ctxPollutant, {
        type: 'bar',
        data: {
            labels: ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3'],
            datasets: [{
                label: 'Concentration (µg/m³)',
                data: [15, 30, 22, 5, 40, 60],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(16, 185, 129, 0.7)',
                    'rgba(59, 130, 246, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)'
                ],
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
            }]
        },
        options: { ...commonOptions, scales: { x: commonOptions.scales.x, y: commonOptions.scales.y } }
    });

    // 3. AQI Category Pie Chart
    const ctxPie = document.getElementById('aqiPieChart').getContext('2d');
    const pieChart = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Good', 'Moderate', 'Unhealthy', 'Hazardous'],
            datasets: [{
                data: [60, 25, 10, 5],
                backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
                borderWidth: 0, hoverOffset: 10
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#f8fafc' } } },
            cutout: '70%'
        }
    });

    // 4. Temperature Trend
    const ctxTemp = document.getElementById('tempTrendChart').getContext('2d');
    const tempChart = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Temp (°C)',
                data: [20, 22, 21, 24, 25, 23, 19],
                borderColor: '#f59e0b',
                backgroundColor: createGradient(ctxTemp, 'rgba(245, 158, 11, 0.5)', 'rgba(245, 158, 11, 0.0)'),
                borderWidth: 2, fill: true, tension: 0.3
            }]
        },
        options: commonOptions
    });

    // 5. Humidity Trend
    const ctxHum = document.getElementById('humidityTrendChart').getContext('2d');
    const humChart = new Chart(ctxHum, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Humidity (%)',
                data: [60, 55, 62, 50, 48, 65, 70],
                borderColor: '#10b981',
                backgroundColor: createGradient(ctxHum, 'rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0.0)'),
                borderWidth: 2, fill: true, tension: 0.3
            }]
        },
        options: commonOptions
    });

    // 6. Wind Speed Trend
    const ctxWind = document.getElementById('windTrendChart').getContext('2d');
    const windChart = new Chart(ctxWind, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Wind Speed (m/s)',
                data: [3.5, 4.2, 2.1, 5.5, 6.0, 3.8, 2.5],
                borderColor: '#8b5cf6',
                backgroundColor: createGradient(ctxWind, 'rgba(139, 92, 246, 0.5)', 'rgba(139, 92, 246, 0.0)'),
                borderWidth: 2, fill: true, tension: 0.4
            }]
        },
        options: commonOptions
    });

    // --- Real-Time Updates Logic (Websocket Simulation) ---
    function updateDashboardData() {
        // Randomize Data for Real-Time Effect
        const newAqi = Math.floor(Math.random() * 60) + 40;
        const predAqi = newAqi + Math.floor(Math.random() * 20) - 10;
        const alerts = Math.floor(Math.random() * 3);
        
        // 1. Update 5 Dashboard Cards
        document.getElementById('cardCurrentAqi').innerText = newAqi;
        document.getElementById('cardPredictedAqi').innerText = predAqi;
        document.getElementById('cardAlerts').innerText = alerts;
        
        const statusEl = document.getElementById('cardStatus');
        const adviceEl = document.getElementById('cardAdvice');
        
        if (newAqi <= 50) {
            statusEl.innerText = "Good";
            statusEl.style.color = "var(--success)";
            adviceEl.innerText = "Air quality is good. Enjoy outdoor activities.";
        } else if (newAqi <= 100) {
            statusEl.innerText = "Moderate";
            statusEl.style.color = "var(--warning)";
            adviceEl.innerText = "Sensitive groups should reduce prolonged outdoor exertion.";
        } else {
            statusEl.innerText = "Unhealthy";
            statusEl.style.color = "var(--danger)";
            adviceEl.innerText = "Avoid prolonged outdoor exertion. Wear a mask.";
        }

        // 2. Update Charts (Shift time series array)
        const updateChartData = (chart, newVal) => {
            const dataArray = chart.data.datasets[0].data;
            dataArray.shift();
            dataArray.push(newVal);
            chart.update('none'); // Update without full layout recalculation for real-time smoothness
        };

        updateChartData(aqiChart, newAqi);
        updateChartData(tempChart, 20 + Math.random() * 5);
        updateChartData(humChart, 50 + Math.random() * 20);
        updateChartData(windChart, 2 + Math.random() * 5);
        
        // Pollutant bar chart gets slightly randomized
        pollutantChart.data.datasets[0].data = pollutantChart.data.datasets[0].data.map(v => Math.max(0, v + (Math.random() * 4 - 2)));
        pollutantChart.update('none');
    }

    function simulateRealTimeUpdates() {
        updateDashboardData(); // Call immediately
        setInterval(updateDashboardData, 5000); // Polling every 5 seconds
    }

    simulateRealTimeUpdates();
});
