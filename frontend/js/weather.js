// frontend/js/weather.js

const OPENWEATHER_API_KEY = 'b101a416d62828bb317b839461ca5493';

// ─── Calculate Individual AQI based on EPA breakpoints ────────
function calcPollutantAQI(concentration, breakpoints) {
    let c = parseFloat(concentration);
    if (isNaN(c)) return 0; // Handle missing data safely

    for (const bp of breakpoints) {
        // Checking only the upper bound handles floating-point gaps naturally
        if (c <= bp.c_high) {
            const c_eff = Math.max(c, bp.c_low); // Prevent negative AQI
            return Math.round(
                ((bp.aqi_high - bp.aqi_low) / (bp.c_high - bp.c_low)) *
                (c_eff - bp.c_low) + bp.aqi_low
            );
        }
    }
    return 500; // Max if out of range or extremely high
}

// ─── Calculate Overall US EPA AQI ────────────────────────────────
function calculateOverallAQI(components) {
    // Breakpoints for PM2.5 (µg/m³) - Updated to US EPA 2024 Standard
    const pm25_bp = [
        { c_low: 0.0,   c_high: 9.0,   aqi_low: 0,   aqi_high: 50  },
        { c_low: 9.1,   c_high: 35.4,  aqi_low: 51,  aqi_high: 100 },
        { c_low: 35.5,  c_high: 55.4,  aqi_low: 101, aqi_high: 150 },
        { c_low: 55.5,  c_high: 125.4, aqi_low: 151, aqi_high: 200 },
        { c_low: 125.5, c_high: 225.4, aqi_low: 201, aqi_high: 300 },
        { c_low: 225.5, c_high: 325.4, aqi_low: 301, aqi_high: 400 },
        { c_low: 325.5, c_high: 500.4, aqi_low: 401, aqi_high: 500 }
    ];

    // Breakpoints for PM10 (µg/m³)
    const pm10_bp = [
        { c_low: 0,   c_high: 54,  aqi_low: 0,   aqi_high: 50  },
        { c_low: 55,  c_high: 154, aqi_low: 51,  aqi_high: 100 },
        { c_low: 155, c_high: 254, aqi_low: 101, aqi_high: 150 },
        { c_low: 255, c_high: 354, aqi_low: 151, aqi_high: 200 },
        { c_low: 355, c_high: 424, aqi_low: 201, aqi_high: 300 },
        { c_low: 425, c_high: 604, aqi_low: 301, aqi_high: 500 }
    ];

    // Convert OpenWeather µg/m³ to standard units (ppb/ppm) for EPA calculations
    const no2_ppb = components.no2 / 1.88;
    const no2_bp = [
        { c_low: 0,   c_high: 53,   aqi_low: 0,   aqi_high: 50  },
        { c_low: 54,  c_high: 100,  aqi_low: 51,  aqi_high: 100 },
        { c_low: 101, c_high: 360,  aqi_low: 101, aqi_high: 150 },
        { c_low: 361, c_high: 649,  aqi_low: 151, aqi_high: 200 },
        { c_low: 650, c_high: 1249, aqi_low: 201, aqi_high: 300 },
        { c_low: 1250,c_high: 2049, aqi_low: 301, aqi_high: 500 }
    ];

    const co_ppm = components.co / 1145;
    const co_bp = [
        { c_low: 0.0, c_high: 4.4,  aqi_low: 0,   aqi_high: 50  },
        { c_low: 4.5, c_high: 9.4,  aqi_low: 51,  aqi_high: 100 },
        { c_low: 9.5, c_high: 12.4, aqi_low: 101, aqi_high: 150 },
        { c_low: 12.5,c_high: 15.4, aqi_low: 151, aqi_high: 200 },
        { c_low: 15.5,c_high: 30.4, aqi_low: 201, aqi_high: 300 },
        { c_low: 30.5,c_high: 50.4, aqi_low: 301, aqi_high: 500 }
    ];

    const so2_ppb = components.so2 / 2.62;
    const so2_bp = [
        { c_low: 0,   c_high: 35,   aqi_low: 0,   aqi_high: 50  },
        { c_low: 36,  c_high: 75,   aqi_low: 51,  aqi_high: 100 },
        { c_low: 76,  c_high: 185,  aqi_low: 101, aqi_high: 150 },
        { c_low: 186, c_high: 304,  aqi_low: 151, aqi_high: 200 },
        { c_low: 305, c_high: 604,  aqi_low: 201, aqi_high: 300 },
        { c_low: 605, c_high: 1004, aqi_low: 301, aqi_high: 500 }
    ];

    const o3_ppb = components.o3 / 1.96;
    const o3_bp = [
        { c_low: 0,   c_high: 54,   aqi_low: 0,   aqi_high: 50  },
        { c_low: 55,  c_high: 70,   aqi_low: 51,  aqi_high: 100 },
        { c_low: 71,  c_high: 85,   aqi_low: 101, aqi_high: 150 },
        { c_low: 86,  c_high: 105,  aqi_low: 151, aqi_high: 200 },
        { c_low: 106, c_high: 200,  aqi_low: 201, aqi_high: 300 },
        { c_low: 201, c_high: 604,  aqi_low: 301, aqi_high: 500 }
    ];

    // Calculate individual AQIs
    const aqi_pm25 = calcPollutantAQI(components.pm2_5, pm25_bp);
    const aqi_pm10 = calcPollutantAQI(components.pm10, pm10_bp);
    const aqi_no2  = calcPollutantAQI(no2_ppb, no2_bp);
    const aqi_co   = calcPollutantAQI(co_ppm, co_bp);
    const aqi_so2  = calcPollutantAQI(so2_ppb, so2_bp);
    const aqi_o3   = calcPollutantAQI(o3_ppb, o3_bp);

    // The true AQI is the highest of all pollutant AQIs
    return Math.max(aqi_pm25, aqi_pm10, aqi_no2, aqi_co, aqi_so2, aqi_o3);
}

// ─── Get category info from real AQI number ──────────────────────
function getAqiInfoFromNumber(aqiNumber) {
    if (aqiNumber <= 50)  return { label: 'Good',                    color: '#17c964', advice: 'Air quality is excellent. Enjoy all outdoor activities freely.' };
    if (aqiNumber <= 100) return { label: 'Moderate',                color: '#f5c76e', advice: 'Air quality is acceptable. Sensitive people should reduce prolonged outdoor exertion.' };
    if (aqiNumber <= 150) return { label: 'Unhealthy for Sensitive', color: '#f97316', advice: 'Sensitive groups (children, elderly, asthma patients) may experience health effects. Limit outdoor exposure.' };
    if (aqiNumber <= 200) return { label: 'Unhealthy',               color: '#ef4444', advice: 'Everyone may experience health effects. Reduce prolonged or heavy outdoor exertion.' };
    if (aqiNumber <= 300) return { label: 'Very Unhealthy',          color: '#8b5cf6', advice: 'Health alert! Everyone should avoid prolonged outdoor activities. Wear a mask if going outside.' };
    return                       { label: 'Hazardous',               color: '#f87171', advice: 'EMERGENCY: Health warning for everyone. Stay indoors, close windows, use air purifiers immediately.' };
}

// ─── Shared UI helpers ───────────────────────────────────────────
function showLoader(message = 'Fetching live data...') {
    const loaderText = document.getElementById('loaderText');
    if (loaderText) loaderText.innerText = message;
    
    const wrapper = document.getElementById('loader-wrapper');
    if (wrapper) wrapper.style.display = 'block';
    
    const result = document.getElementById('aqiResult');
    if (result) result.style.display = 'none';
}

function hideLoader() {
    const wrapper = document.getElementById('loader-wrapper');
    if (wrapper) wrapper.style.display = 'none';
}

// ─── Map Initialization ──────────────────────────────────────────
let map;
let marker;
function initMap() {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer || typeof L === 'undefined') return;
    
    // Default to a world view
    map = L.map('mapContainer').setView([20, 0], 2);
    
    // Default OpenStreetMap tiles for vibrant colors
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // ─── OPTION 3: Interactive Map Click ────────────────────────────
    // Change cursor to indicate the map is clickable
    document.getElementById('mapContainer').style.cursor = 'crosshair';

    map.on('click', async function(e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        
        showLoader('Reverse geocoding map location...');
        try {
            // Convert coordinates to a readable city name using OpenWeather API
            const geoRes = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
            );
            const geoData = await geoRes.json();
            
            let cityName = 'Pinned Location';
            if (geoData && geoData.length > 0) {
                cityName = geoData[0].name;
                if (geoData[0].state) cityName += `, ${geoData[0].state}`;
                else if (geoData[0].country) cityName += `, ${geoData[0].country}`;
            } else {
                cityName = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
            }
            
            document.getElementById('loaderText').innerText = `Fetching AQI for ${cityName}...`;
            // Trigger the core fetch function using the clicked coordinates
            await fetchAqiFromCoords(lat, lon, cityName);
        } catch(err) {
            hideLoader();
            if(typeof showToast === 'function') showToast('Failed to fetch location data from map click.', 'error');
        }
    });

}

// Initialize map on load if container exists
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    
    // Auto-search if city is passed in URL (from History page)
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');
    if (cityParam) {
        const cityInput = document.getElementById('citySearch');
        const form = document.getElementById('liveAqiForm');
        if (cityInput && form) {
            cityInput.value = cityParam;
            // Add a small delay to ensure the page is fully rendered before showing the loader
            setTimeout(() => {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }, 300);
        }
    }
});

// ─── Populate results on the page ────────────────────────────────
function populateResults(cityName, data, lat, lon) {
    // Use pre-calculated real AQI number
    const realAQI = data.realAQI;
    const info = getAqiInfoFromNumber(realAQI);

    document.getElementById('resultCity').innerText = cityName;
    document.getElementById('resultTimestamp').innerText = 'Last updated: ' + new Date().toLocaleTimeString();

    // Save to localStorage so the Command Center dashboard can reflect the real live data
    localStorage.setItem('lastCheckedCity', cityName);
    localStorage.setItem('lastCheckedAQI', realAQI);
    if (lat && lon) {
        localStorage.setItem('lastCheckedLat', lat);
        localStorage.setItem('lastCheckedLon', lon);
    }

    // Save to searchHistory array for the Historical Data page
    const historyObj = {
        date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
        location: cityName,
        aqi: realAQI,
        status: info.label,
        color: info.color
    };
    let historyArr = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    // Add to beginning of array
    historyArr.unshift(historyObj);
    // Keep only last 50
    if(historyArr.length > 50) historyArr.pop();
    localStorage.setItem('searchHistory', JSON.stringify(historyArr));

    // Status badge
    const badge = document.getElementById('aqiStatusBadge');
    badge.innerText = info.label;
    badge.className = 'badge';
    
    // Set custom badge color dynamically
    badge.style.background = info.color + '22';
    badge.style.color = info.color;
    badge.style.border = `1.5px solid ${info.color}66`;
    badge.style.fontSize = '0.95rem';
    badge.style.fontWeight = '800';
    badge.style.padding = '8px 16px';

    // Glow background
    const glowBg = document.getElementById('aqiGlowBg');
    if (glowBg) glowBg.style.background = info.color;

    // Show real AQI number
    const aqiEl = document.getElementById('resAQI');
    aqiEl.innerText = realAQI;
    aqiEl.style.color = info.color;

    // Animate SVG Ring
    const ring = document.getElementById('aqiProgressRing');
    if (ring) {
        ring.style.stroke = info.color;
        // Max AQI on scale is 500. Calculate offset for circumference = 502
        const percent = Math.min(realAQI / 500, 1);
        const offset = 502 - (percent * 502);
        // Force reflow
        ring.style.strokeDashoffset = '502';
        setTimeout(() => {
            ring.style.strokeDashoffset = offset;
        }, 100);
    }

    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setVal('resTemp', data.Temperature + ' °C');
    setVal('resHum', data.Humidity + ' %');
    setVal('resPM25', data.PM25);
    setVal('resNO2', data.NO2);
    setVal('resWind', data.Wind_Speed);
    setVal('resCO', data.CO);

    const adviceText = document.getElementById('healthAdviceText');
    if (adviceText) adviceText.innerText = info.advice;
    
    const adviceBox = document.getElementById('healthAdviceBox');
    if (adviceBox) adviceBox.style.borderLeftColor = info.color;

    const resultPanel = document.getElementById('aqiResult');
    if (resultPanel) {
        resultPanel.style.display = 'flex';
        // Re-calculate map size if it was hidden
        if (map) {
            setTimeout(() => { map.invalidateSize(); }, 100);
        }
    }

    // Trigger visual smog simulation
    if (typeof startSmogSimulation === 'function') {
        startSmogSimulation(realAQI);
    }

    // AI Audio Briefing Logic
    const btnAudio = document.getElementById('btnAiAudio');
    if (btnAudio) {
        btnAudio.onclick = () => {
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();
                
                const textToSpeak = `The current Air Quality Index for ${cityName} is ${realAQI}. This is classified as ${info.label}. ${info.advice}`;
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                
                // Optional: Make it sound more like an AI assistant if a good voice is available
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || v.lang === 'en-US');
                if (preferredVoice) utterance.voice = preferredVoice;
                
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                
                window.speechSynthesis.speak(utterance);
                if(typeof showToast === 'function') showToast('Playing AI Audio Briefing...', 'info');
            } else {
                if(typeof showToast === 'function') showToast('Audio not supported in this browser.', 'error');
            }
        };
    }

    // Update AQI Scale Pointer
    const pointer = document.getElementById('aqiScalePointer');
    const dot = document.getElementById('aqiScaleDot');
    if (pointer && dot) {
        let pct = 0;
        if (realAQI <= 50) pct = (realAQI / 50) * 16.66;
        else if (realAQI <= 100) pct = 16.66 + ((realAQI - 50) / 50) * 16.66;
        else if (realAQI <= 150) pct = 33.33 + ((realAQI - 100) / 50) * 16.66;
        else if (realAQI <= 200) pct = 50 + ((realAQI - 150) / 50) * 16.66;
        else if (realAQI <= 300) pct = 66.66 + ((realAQI - 200) / 100) * 16.66;
        else pct = 83.33 + (Math.min((realAQI - 300), 100) / 100) * 16.66;
        
        pointer.style.left = pct + '%';
        pointer.style.display = 'block';
        dot.style.left = pct + '%';
        dot.style.display = 'block';
        dot.style.background = info.color;
        dot.style.boxShadow = `0 0 14px ${info.color}`;
    }

    // Update Map Marker
    if (map && lat && lon) {
        map.setView([lat, lon], 12);
        if (marker) map.removeLayer(marker);
        
        // Highly visible, pulsing CSS marker (Standard Blue for map contrast)
        const markerColor = '#0070f3'; // Bright accent blue
        const pulseHtml = `
            <div style="--pulse-color: ${markerColor}; width: 28px; height: 28px; background: ${markerColor}; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px ${markerColor}, inset 0 0 8px rgba(0,0,0,0.3); animation: markerPulse 2s infinite;"></div>
        `;
        const customIcon = L.divIcon({
            className: 'custom-pulse-marker',
            html: pulseHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });
        marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
        marker.bindPopup(`<b>${cityName}</b><br>AQI: ${realAQI}`).openPopup();
    }

    // Dangerous AQI popup (trigger at real AQI > 200)
    if (realAQI > 200) {
        // Store current hazard info for the SMS function
        window.currentHazardCity = cityName;
        window.currentHazardAQI = realAQI;
        
        const modal = document.getElementById('dangerModal');
        if (modal) {
            modal.style.display = 'flex';
            const statusEl = document.getElementById('smsStatus');
            if (statusEl) statusEl.style.display = 'none'; // reset status
        }
        if(typeof showToast === 'function') showToast('⚠️ Hazardous AQI detected!', 'error');
    }

    // Store data for PDF
    const btnDown = document.getElementById('btnDownloadReport');
    if (btnDown) {
        btnDown.onclick = () => generateReport(cityName, data, info);
    }
}

// ─── SMS Alert Function ──────────────────────────────────────────
async function broadcastEmergencySMS() {
    const statusEl = document.getElementById('smsStatus');
    const city = window.currentHazardCity || 'Unknown Location';
    const aqi = window.currentHazardAQI || 'Unknown';

    try {
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--text-secondary)';
        statusEl.innerText = 'Broadcasting Alert...';

        const token = localStorage.getItem('token') || '';
        // If the user runs frontend and backend on different ports locally
        const res = await fetch('http://localhost:5000/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                city: city,
                aqi: aqi
            })
        });

        const data = await res.json();
        
        if (res.ok) {
            statusEl.style.color = 'var(--success)';
            statusEl.innerText = `Broadcast Sent to ${data.count || 'all'} Residents!`;
            if(typeof showToast === 'function') showToast('Emergency Broadcast Sent!', 'success');
        } else {
            statusEl.style.color = 'var(--danger)';
            statusEl.innerText = 'Error: ' + (data.message || 'Failed to broadcast');
        }
    } catch(err) {
        statusEl.style.display = 'block';
        statusEl.style.color = 'var(--danger)';
        statusEl.innerText = 'Error: Could not reach backend server.';
    }
}

// ─── PDF Report Generator ─────────────────────────────────────────
function generateReport(cityName, data, info) {
    if(typeof showToast === 'function') showToast('Preparing your report...', 'info');

    const now = new Date().toLocaleString();
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>AirGuard AI – Air Quality Report – ${cityName}</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
            h1 { color: #1e3a5f; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #1e3a5f; margin-top: 30px; }
            .aqi-big { font-size: 72px; font-weight: 900; color: ${info.color}; text-align: center; margin: 20px 0 5px; }
            .aqi-label { text-align: center; font-size: 1.2rem; font-weight: bold; color: ${info.color}; margin-bottom: 5px; }
            .aqi-sub { text-align: center; color: #64748b; font-size: 0.9rem; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #1e3a5f; color: white; padding: 10px 15px; text-align: left; }
            td { padding: 10px 15px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge { display: inline-block; padding: 5px 14px; border-radius: 20px; font-weight: bold; color: white; background: ${info.color}; }
            .advice-box { background: #f0f9ff; border-left: 4px solid ${info.color}; padding: 15px 20px; border-radius: 8px; margin-top: 15px; }
            .footer { margin-top: 40px; color: #94a3b8; font-size: 0.8rem; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
    </head>
    <body>
        <h1>🌍 AirGuard AI — Air Quality Report</h1>
        <p><strong>Location:</strong> ${cityName}</p>
        <p><strong>Generated On:</strong> ${now}</p>
        <p><strong>Status:</strong> <span class="badge">${info.label}</span></p>

        <div class="aqi-big">${data.realAQI}</div>
        <div class="aqi-label">${info.label}</div>
        <div class="aqi-sub">Current AQI on US EPA Scale (0–500) | OpenWeather Index: ${data.AQI}/5</div>

        <h2>Air Quality Metrics</h2>
        <table>
            <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
            <tr><td><strong>AQI (US EPA Scale)</strong></td><td><strong>${data.realAQI}</strong></td><td>0–500</td></tr>
            <tr><td>PM2.5</td><td>${data.PM25}</td><td>µg/m³</td></tr>
            <tr><td>NO₂</td><td>${data.NO2}</td><td>µg/m³</td></tr>
            <tr><td>CO</td><td>${data.CO}</td><td>µg/m³</td></tr>
        </table>

        <h2>Meteorological Conditions</h2>
        <table>
            <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
            <tr><td>Temperature</td><td>${data.Temperature}</td><td>°C</td></tr>
            <tr><td>Humidity</td><td>${data.Humidity}</td><td>%</td></tr>
            <tr><td>Wind Speed</td><td>${data.Wind_Speed}</td><td>m/s</td></tr>
        </table>

        <h2>Health Advice & Recommendations</h2>
        <div class="advice-box">${info.advice}</div>

        <div class="footer">
            <p>Generated by AirGuard AI | Data: OpenWeather Air Pollution API | AQI calculated via US EPA PM2.5 breakpoints</p>
        </div>
    </body>
    </html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
    if(typeof showToast === 'function') showToast('Report ready! Use "Save as PDF" in the print dialog.', 'success');
}

// ─── OPTION 1: Auto-detect current location ──────────────────────
window.fetchByLocation = function() {
    if (!navigator.geolocation) {
        if(typeof showToast === 'function') showToast('Geolocation is not supported by your browser.', 'error');
        return;
    }
    showLoader('Detecting your location...');
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        document.getElementById('loaderText').innerText = 'Fetching AQI for your location...';
        try {
            const geoRes = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`
            );
            const geoData = await geoRes.json();
            const cityName = geoData[0]?.name || 'Your Location';
            await fetchAqiFromCoords(latitude, longitude, cityName);
        } catch(err) {
            hideLoader();
            if(typeof showToast === 'function') showToast('Failed to fetch location data.', 'error');
        }
    }, () => {
        hideLoader();
        if(typeof showToast === 'function') showToast('Location access denied. Please allow location permission.', 'error');
    });
};

// ─── OPTION 2: City name search with Autocomplete ─────────────────
const liveAqiForm = document.getElementById('liveAqiForm');
const citySearchInput = document.getElementById('citySearch');
const autocompleteResults = document.getElementById('autocompleteResults');

if (citySearchInput && autocompleteResults) {
    let debounceTimer;
    
    // Hide dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (!autocompleteResults.contains(e.target) && e.target !== citySearchInput) {
            autocompleteResults.style.display = 'none';
        }
    });

    citySearchInput.addEventListener('focus', function() {
        const query = this.value.trim();
        if (query.length === 0) {
            showRecentSearches();
        }
    });

    function showRecentSearches() {
        try {
            const historyStr = localStorage.getItem('searchHistory');
            if (!historyStr) return;
            const history = JSON.parse(historyStr);
            if (!history || history.length === 0) return;
            
            // Get last 2 unique cities
            const recentCities = [];
            for (let i = 0; i < history.length; i++) {
                if (history[i].location && !recentCities.includes(history[i].location)) {
                    recentCities.push(history[i].location);
                }
                if (recentCities.length >= 2) break;
            }
            
            if (recentCities.length > 0) {
                autocompleteResults.innerHTML = '<div style="padding: 8px 16px; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; background: var(--bg-secondary);">Recent Searches</div>';
                
                recentCities.forEach(city => {
                    const div = document.createElement('div');
                    div.style.padding = '12px 16px';
                    div.style.cursor = 'pointer';
                    div.style.borderBottom = '1px solid var(--border-subtle)';
                    div.style.color = 'var(--text-primary)';
                    div.style.fontWeight = '500';
                    
                    div.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${city}`;
                    
                    div.addEventListener('mouseenter', () => { div.style.background = 'var(--bg-tertiary)'; div.style.color = 'var(--accent-color)'; });
                    div.addEventListener('mouseleave', () => { div.style.background = 'transparent'; div.style.color = 'var(--text-primary)'; });
                    
                    div.addEventListener('click', () => {
                        citySearchInput.value = city;
                        autocompleteResults.style.display = 'none';
                        // trigger submit
                        liveAqiForm.dispatchEvent(new Event('submit'));
                    });
                    
                    autocompleteResults.appendChild(div);
                });
                autocompleteResults.style.display = 'block';
            }
        } catch (e) {
            console.error(e);
        }
    }

    citySearchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim();
        
        if (query.length === 0) {
            showRecentSearches();
            return;
        }
        
        if (query.length < 3) {
            autocompleteResults.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const geoRes = await fetch(
                    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`
                );
                const geoData = await geoRes.json();
                
                if (geoData && geoData.length > 0) {
                    autocompleteResults.innerHTML = '';
                    
                    // Filter out exact duplicates based on lat/lon rounding
                    const uniquePlaces = [];
                    const seenCoords = new Set();
                    geoData.forEach(place => {
                        const coordKey = `${place.lat.toFixed(2)},${place.lon.toFixed(2)}`;
                        if (!seenCoords.has(coordKey)) {
                            seenCoords.add(coordKey);
                            uniquePlaces.push(place);
                        }
                    });

                    uniquePlaces.forEach(place => {
                        const div = document.createElement('div');
                        div.style.padding = '12px 16px';
                        div.style.cursor = 'pointer';
                        div.style.borderBottom = '1px solid var(--border-subtle)';
                        div.style.color = 'var(--text-primary)';
                        div.style.fontSize = '0.95rem';
                        div.style.fontWeight = '500';
                        
                        // Hover effect
                        div.addEventListener('mouseenter', () => { div.style.background = 'var(--bg-tertiary)'; div.style.color = 'var(--accent-color)'; });
                        div.addEventListener('mouseleave', () => { div.style.background = 'transparent'; div.style.color = 'var(--text-primary)'; });
                        
                        const placeName = place.state ? `${place.name}, ${place.state}, ${place.country}` : `${place.name}, ${place.country}`;
                        
                        // Bold the matching text
                        const regex = new RegExp(`(${query})`, "gi");
                        div.innerHTML = placeName.replace(regex, "<strong style='font-weight: 800;'>$1</strong>");
                        
                        div.addEventListener('click', async () => {
                            citySearchInput.value = place.name;
                            autocompleteResults.style.display = 'none';
                            // Immediately fetch AQI for this exact coordinate
                            showLoader(`Fetching AQI for ${placeName}...`);
                            await fetchAqiFromCoords(place.lat, place.lon, place.name);
                        });
                        
                        autocompleteResults.appendChild(div);
                    });
                    autocompleteResults.style.display = 'block';
                } else {
                    autocompleteResults.style.display = 'none';
                }
            } catch (err) {
                console.error("Autocomplete error:", err);
            }
        }, 400); // 400ms debounce
    });
}

if (liveAqiForm) {
    liveAqiForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const city = document.getElementById('citySearch').value.trim();
        if (!city) return;

        // --- SECRET DEMO OVERRIDE FOR PRESENTATIONS ---
        if (city.toLowerCase() === 'test alert') {
            const fakeData = {
                AQI: 5,
                realAQI: 412,
                PM25: "350.50",
                NO2: "200.00",
                CO: "15.00",
                Temperature: "32.0",
                Humidity: 45,
                Wind_Speed: "2.1"
            };
            populateResults("Delhi (Demo Mode)", fakeData, 28.6139, 77.2090);
            return;
        }
        // ----------------------------------------------

        showLoader(`Searching for ${city}...`);
        try {
            const geoRes = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
            );
            const geoData = await geoRes.json();
            if (!geoData || geoData.length === 0) {
                hideLoader();
                if(typeof showToast === 'function') showToast(`City "${city}" not found.`, 'error');
                return;
            }
            const { lat, lon, name } = geoData[0];
            await fetchAqiFromCoords(lat, lon, name);
        } catch(err) {
            hideLoader();
            if(typeof showToast === 'function') showToast('API call failed. Check your OpenWeather API key.', 'error');
        }
    });
}

// ─── Core API fetch (used by both options) ────────────────────────
async function fetchAqiFromCoords(lat, lon, cityName) {
    try {
        const [aqiRes, weatherRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`),
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`)
        ]);

        const aqiJson     = await aqiRes.json();
        const weatherJson = await weatherRes.json();

        const components = aqiJson.list[0].components;
        const realAQI = calculateOverallAQI(components);

        const data = {
            AQI:         aqiJson.list[0].main.aqi,
            realAQI:     realAQI,
            PM25:        components.pm2_5.toFixed(2),
            NO2:         components.no2.toFixed(2),
            CO:          components.co.toFixed(2),
            Temperature: weatherJson.main.temp.toFixed(1),
            Humidity:    weatherJson.main.humidity,
            Wind_Speed:  weatherJson.wind.speed.toFixed(1)
        };

        hideLoader();
        populateResults(cityName, data, lat, lon);
        if(typeof showToast === 'function') showToast(`Live data fetched for ${cityName}!`, 'success');

    } catch(err) {
        hideLoader();
        if(typeof showToast === 'function') showToast('Error fetching weather data. Check API key or network.', 'error');
    }
}
