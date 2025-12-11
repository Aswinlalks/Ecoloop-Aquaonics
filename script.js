const CHANNEL_ID = "2836610";
const READ_API_KEY = "4Q685BUVRN5C65Q5";
const WRITE_API_KEY = "YRCGOFCWY5D0X1L1";

// Global chart instances
let charts = {
  temp: null,
  ph: null,
  nh3: null,
  combined: null
};

async function fetchField(field) {
    const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/${field}.json?api_key=${READ_API_KEY}&results=200`;
    let res = await fetch(url);
    return await res.json();
}

// Format date for display
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Create gradient for charts
function createGradient(ctx, color1, color2) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

// Dashboard loading
async function loadDashboard() {
    try {
        console.log('Loading dashboard...');
        const [tempData, phData, nh3Data] = await Promise.all([
            fetchField(1),
            fetchField(2),
            fetchField(3)
        ]);

        console.log('Data loaded:', {temp: tempData.feeds.length, ph: phData.feeds.length, nh3: nh3Data.feeds.length});

        // Update current values
        if (tempData.feeds.length > 0) {
            const lastTemp = tempData.feeds[tempData.feeds.length - 1];
            const currentTempElem = document.getElementById('currentTemp');
            if (currentTempElem) {
                currentTempElem.textContent = `${lastTemp.field1} °C`;
            }
        }
        if (phData.feeds.length > 0) {
            const lastPH = phData.feeds[phData.feeds.length - 1];
            const currentPHElem = document.getElementById('currentPH');
            if (currentPHElem) {
                currentPHElem.textContent = lastPH.field2;
            }
        }
        if (nh3Data.feeds.length > 0) {
            const lastNH3 = nh3Data.feeds[nh3Data.feeds.length - 1];
            const currentNH3Elem = document.getElementById('currentNH3');
            if (currentNH3Elem) {
                currentNH3Elem.textContent = `${lastNH3.field3} ppm`;
            }
        }

        // Create charts
        createTemperatureChart(tempData);
        createPHChart(phData);
        createAmmoniaChart(nh3Data);
        createCombinedChart(phData, nh3Data);
        
        // Update last updated time
        updateLastUpdateTime([tempData, phData, nh3Data]);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showErrorMessage('Failed to load data. Please try again.');
    }
}

function createTemperatureChart(data) {
    const canvas = document.getElementById('tempChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const labels = data.feeds.map(f => formatDateTime(f.created_at));
    const values = data.feeds.map(f => parseFloat(f.field1));
    
    if (charts.temp) charts.temp.destroy();
    
    charts.temp = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature',
                data: values,
                borderColor: '#e74c3c',
                backgroundColor: createGradient(ctx, 'rgba(231, 76, 60, 0.2)', 'rgba(231, 76, 60, 0)'),
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    title: {
                        display: true,
                        text: '°C'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function createPHChart(data) {
    const canvas = document.getElementById('phChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const labels = data.feeds.map(f => formatDateTime(f.created_at));
    const values = data.feeds.map(f => parseFloat(f.field2));
    
    if (charts.ph) charts.ph.destroy();
    
    charts.ph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'pH',
                data: values,
                borderColor: '#3498db',
                backgroundColor: createGradient(ctx, 'rgba(52, 152, 219, 0.2)', 'rgba(52, 152, 219, 0)'),
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function createAmmoniaChart(data) {
    const canvas = document.getElementById('nh3Chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const labels = data.feeds.map(f => formatDateTime(f.created_at));
    const values = data.feeds.map(f => parseFloat(f.field3));
    
    if (charts.nh3) charts.nh3.destroy();
    
    charts.nh3 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ammonia',
                data: values,
                borderColor: '#9b59b6',
                backgroundColor: createGradient(ctx, 'rgba(155, 89, 182, 0.2)', 'rgba(155, 89, 182, 0)'),
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    title: {
                        display: true,
                        text: 'ppm'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function createCombinedChart(phData, nh3Data) {
    const canvas = document.getElementById('combinedChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const labels = phData.feeds.map(f => formatDateTime(f.created_at));
    
    if (charts.combined) charts.combined.destroy();
    
    charts.combined = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'pH Level',
                    data: phData.feeds.map(f => parseFloat(f.field2)),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Ammonia (NH₃) ppm',
                    data: nh3Data.feeds.map(f => parseFloat(f.field3)),
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'pH Level'
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Ammonia (ppm)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function updateLastUpdateTime(datasets) {
    let latestTime = new Date(0);
    
    datasets.forEach(data => {
        if (data.feeds.length > 0) {
            const lastFeed = data.feeds[data.feeds.length - 1];
            const feedTime = new Date(lastFeed.created_at);
            if (feedTime > latestTime) {
                latestTime = feedTime;
            }
        }
    });
    
    if (latestTime > new Date(0)) {
        const lastUpdateElem = document.getElementById('lastUpdateTime');
        if (lastUpdateElem) {
            lastUpdateElem.textContent = 
                latestTime.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
        }
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'status-message status-error';
    errorDiv.textContent = message;
    const container = document.querySelector('.container');
    if (container) {
        container.prepend(errorDiv);
    }
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// ===== STATS PAGE FUNCTIONS =====
async function loadStats() {
    try {
        console.log('Loading stats...');
        const [tempData, phData, nh3Data] = await Promise.all([
            fetchField(1),
            fetchField(2),
            fetchField(3)
        ]);

        console.log('Stats data loaded');

        // Calculate temperature statistics
        const temps = tempData.feeds.map(f => parseFloat(f.field1));
        const highTemp = Math.max(...temps);
        const lowTemp = Math.min(...temps);
        const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
        const tempRange = (highTemp - lowTemp).toFixed(1);
        
        // Find times for high and low temperatures
        const highTimeIndex = temps.indexOf(highTemp);
        const lowTimeIndex = temps.indexOf(lowTemp);
        const highTime = formatDateTime(tempData.feeds[highTimeIndex].created_at);
        const lowTime = formatDateTime(tempData.feeds[lowTimeIndex].created_at);
        
        // Calculate pH statistics
        const phValues = phData.feeds.map(f => parseFloat(f.field2));
        const currentPH = phValues[phValues.length - 1];
        const phRange = (Math.max(...phValues) - Math.min(...phValues)).toFixed(2);
        const phStability = calculateStability(phValues);
        
        // Calculate Ammonia statistics
        const nh3Values = nh3Data.feeds.map(f => parseFloat(f.field3));
        const currentNH3 = nh3Values[nh3Values.length - 1];
        const nh3Range = (Math.max(...nh3Values) - Math.min(...nh3Values)).toFixed(3);
        const nh3Trend = calculateTrend(nh3Values);
        
        // Update temperature stats
        updateElementText('currentTempStat', `${temps[temps.length - 1]} °C`);
        updateElementText('highTemp', `${highTemp} °C`);
        updateElementText('lowTemp', `${lowTemp} °C`);
        updateElementText('avgTemp', `${avgTemp} °C`);
        updateElementText('highTime', highTime);
        updateElementText('lowTime', lowTime);
        updateElementText('tempRange', `${tempRange}°C`);
        
        // Update pH stats
        updateElementText('currentPHStat', currentPH);
        updateElementText('phRange', phRange);
        updateElementText('phStability', phStability);
        
        // Update Ammonia stats
        updateElementText('currentNH3Stat', `${currentNH3} ppm`);
        updateElementText('nh3Range', `${nh3Range} ppm`);
        updateElementText('nh3Trend', nh3Trend > 0 ? `+${nh3Trend}%` : `${nh3Trend}%`);
        
        // Update times
        if (tempData.feeds.length > 0) {
            updateElementText('tempTime', `Last updated: ${formatDateTime(tempData.feeds[tempData.feeds.length - 1].created_at)}`);
        }
        if (phData.feeds.length > 0) {
            updateElementText('phTime', `Last updated: ${formatDateTime(phData.feeds[phData.feeds.length - 1].created_at)}`);
        }
        if (nh3Data.feeds.length > 0) {
            updateElementText('nh3Time', `Last updated: ${formatDateTime(nh3Data.feeds[nh3Data.feeds.length - 1].created_at)}`);
        }
        
        // Update summary data
        updateElementText('totalReadings', tempData.feeds.length + phData.feeds.length + nh3Data.feeds.length);
        updateElementText('dataPoints', temps.length);
        
        if (tempData.feeds.length > 0) {
            const firstDate = new Date(tempData.feeds[0].created_at);
            updateElementText('monitoringSince', firstDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        }
        
        // Update last update time
        updateElementText('statsUpdateTime', new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        }));
        
        // Generate recommendations
        generateRecommendations(temps[temps.length - 1], currentPH, currentNH3);
        
        // Create mini charts if elements exist
        const tempDistCanvas = document.getElementById('tempDistribution');
        const chemTrendCanvas = document.getElementById('chemistryTrend');
        
        if (tempDistCanvas && temps.length > 0) {
            createDistributionChart(temps, 'tempDistribution', 'Temperature Distribution', '#e74c3c');
        }
        if (chemTrendCanvas && phValues.length > 0 && nh3Values.length > 0) {
            createChemistryTrendChart(phValues, nh3Values);
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
        showErrorMessage('Failed to load statistics. Please try again.');
    }
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function calculateStability(values) {
    if (values.length < 2) return "N/A";
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const deviation = Math.sqrt(variance);
    return deviation < 0.1 ? "Excellent" : 
           deviation < 0.3 ? "Good" : 
           deviation < 0.5 ? "Fair" : "Poor";
}

function calculateTrend(values) {
    if (values.length < 10) return 0;
    const recent = values.slice(-5);
    const previous = values.slice(-10, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    return Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
}

function createDistributionChart(data, canvasId, label, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Create histogram data
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binCount = 5;
    const binSize = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0);
    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
        bins[binIndex]++;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.map((_, i) => {
                const start = min + (i * binSize);
                const end = min + ((i + 1) * binSize);
                return `${start.toFixed(1)}-${end.toFixed(1)}`;
            }),
            datasets: [{
                label: label,
                data: bins,
                backgroundColor: color + '80',
                borderColor: color,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function createChemistryTrendChart(phValues, nh3Values) {
    const canvas = document.getElementById('chemistryTrend');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const labels = phValues.map((_, i) => `Point ${i + 1}`);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.slice(-20),
            datasets: [
                {
                    label: 'pH',
                    data: phValues.slice(-20),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'NH₃',
                    data: nh3Values.slice(-20),
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    title: { text: 'pH', display: true }
                },
                y1: {
                    position: 'right',
                    title: { text: 'NH₃ (ppm)', display: true }
                }
            }
        }
    });
}

function generateRecommendations(temp, ph, nh3) {
    const recommendations = [];
    
    if (temp < 22) {
        recommendations.push('Temperature is low. Consider increasing heater setting.');
    } else if (temp > 28) {
        recommendations.push('Temperature is high. Consider cooling or reducing heater.');
    }
    
    if (ph < 6.5) {
        recommendations.push('pH is too low. Consider adding pH buffer.');
    } else if (ph > 8.5) {
        recommendations.push('pH is too high. Consider adding pH reducer.');
    }
    
    if (nh3 > 0.5) {
        recommendations.push('Ammonia level is dangerous! Perform water change immediately.');
    } else if (nh3 > 0.1) {
        recommendations.push('Ammonia level is elevated. Monitor closely and consider water change.');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('All parameters are within optimal ranges.');
        recommendations.push('Continue regular monitoring schedule.');
    }
    
    const list = document.getElementById('recommendationsList');
    if (list) {
        list.innerHTML = '';
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            list.appendChild(li);
        });
    }
}

// ===== UPDATE PAGE FUNCTIONS =====
async function loadCurrentValues() {
    try {
        const [phData, nh3Data] = await Promise.all([
            fetchField(2),
            fetchField(3)
        ]);
        
        if (phData.feeds.length > 0) {
            const currentPH = phData.feeds[phData.feeds.length - 1].field2;
            updateElementText('currentPhValue', currentPH);
            updatePhRangeFill(parseFloat(currentPH));
        }
        
        if (nh3Data.feeds.length > 0) {
            const currentNH3 = nh3Data.feeds[nh3Data.feeds.length - 1].field3;
            updateElementText('currentNh3Value', `${currentNH3} ppm`);
            updateNh3RangeFill(parseFloat(currentNH3));
        }
        
        loadUpdateHistory();
        
    } catch (error) {
        console.error('Error loading current values:', error);
    }
}

function updatePhRangeFill(ph) {
    const fill = document.getElementById('phRangeFill');
    if (!fill) return;
    
    let width = 50; // Default neutral
    
    if (ph <= 7) {
        width = (ph / 7) * 50; // 0-7 maps to 0-50%
    } else {
        width = 50 + ((ph - 7) / 7) * 50; // 7-14 maps to 50-100%
    }
    
    fill.style.width = `${width}%`;
    fill.style.background = ph < 6.5 ? '#e74c3c' : ph > 8.5 ? '#e74c3c' : '#27ae60';
}

function updateNh3RangeFill(nh3) {
    const fill = document.getElementById('nh3RangeFill');
    if (!fill) return;
    
    const safeLimit = 0.5;
    const maxLimit = 2;
    
    let width = (nh3 / maxLimit) * 100;
    if (width > 100) width = 100;
    
    fill.style.width = `${width}%`;
    fill.style.background = nh3 <= safeLimit ? '#27ae60' : 
                           nh3 <= safeLimit * 2 ? '#f39c12' : '#e74c3c';
}

async function loadUpdateHistory() {
    try {
        const [phData, nh3Data] = await Promise.all([
            fetchField(2),
            fetchField(3)
        ]);
        
        const historyList = document.getElementById('updateHistory');
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        // Combine and sort updates
        const updates = [];
        
        phData.feeds.forEach(feed => {
            if (feed.field2) {
                updates.push({
                    type: 'pH',
                    value: feed.field2,
                    time: feed.created_at,
                    icon: 'fas fa-tint'
                });
            }
        });
        
        nh3Data.feeds.forEach(feed => {
            if (feed.field3) {
                updates.push({
                    type: 'NH₃',
                    value: feed.field3,
                    time: feed.created_at,
                    icon: 'fas fa-skull-crossbones'
                });
            }
        });
        
        // Sort by time (newest first) and take last 5
        updates.sort((a, b) => new Date(b.time) - new Date(a.time));
        const recentUpdates = updates.slice(0, 5);
        
        recentUpdates.forEach(update => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-icon">
                    <i class="${update.icon}"></i>
                </div>
                <div class="history-content">
                    <div class="history-type">${update.type} Update</div>
                    <div class="history-value">${update.type === 'NH₃' ? update.value + ' ppm' : update.value}</div>
                    <div class="history-time">${formatDateTime(update.time)}</div>
                </div>
            `;
            historyList.appendChild(historyItem);
        });
        
    } catch (error) {
        console.error('Error loading update history:', error);
    }
}

function logout() {
    const protectedDiv = document.getElementById('protected');
    const loginBox = document.getElementById('loginBox');
    const passwordInput = document.getElementById('password');
    const status = document.getElementById('status');
    
    if (protectedDiv) protectedDiv.style.display = 'none';
    if (loginBox) loginBox.style.display = 'block';
    if (passwordInput) passwordInput.value = '';
    if (status) {
        status.textContent = '';
        status.className = 'status-message';
    }
}

// Update login function
function login() {
    const pass = document.getElementById("password").value;
    const status = document.getElementById("status");
    
    if (pass === "fish123") {
        const protectedDiv = document.getElementById("protected");
        const loginBox = document.getElementById("loginBox");
        
        if (protectedDiv) protectedDiv.style.display = "block";
        if (loginBox) loginBox.style.display = "none";
        loadCurrentValues();
    } else {
        if (status) {
            status.textContent = "❌ Invalid password! Please try again.";
            status.className = "status-message status-error";
        }
        const passwordInput = document.getElementById("password");
        if (passwordInput) {
            passwordInput.value = "";
            passwordInput.focus();
        }
    }
}

// Update sendUpdate to include range validation
async function sendUpdate() {
    const phInput = document.getElementById("ph");
    const nh3Input = document.getElementById("nh3");
    const status = document.getElementById("status");
    
    if (!phInput || !nh3Input || !status) return;

    const ph = parseFloat(phInput.value);
    const nh3 = parseFloat(nh3Input.value);

    // Validate inputs
    if (isNaN(ph) || isNaN(nh3)) {
        status.textContent = "❌ Please enter valid numbers for both fields";
        status.className = "status-message status-error";
        return;
    }

    if (ph < 0 || ph > 14) {
        status.textContent = "❌ pH must be between 0 and 14";
        status.className = "status-message status-error";
        return;
    }

    if (nh3 < 0) {
        status.textContent = "❌ Ammonia cannot be negative";
        status.className = "status-message status-error";
        return;
    }

    // Show warning for dangerous values
    if (ph < 6.5 || ph > 8.5 || nh3 > 0.5) {
        if (!confirm('⚠️ Values are outside recommended safe ranges. Continue anyway?')) {
            return;
        }
    }

    const url = `https://api.thingspeak.com/update.json?api_key=${WRITE_API_KEY}&field2=${ph}&field3=${nh3}`;
    
    status.textContent = "⏳ Updating...";
    status.className = "status-message";
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.entry_id) {
            status.textContent = "✅ Data updated successfully!";
            status.className = "status-message status-success";
            
            // Update current values display
            updateElementText('currentPhValue', ph);
            updateElementText('currentNh3Value', `${nh3} ppm`);
            updatePhRangeFill(ph);
            updateNh3RangeFill(nh3);
            
            // Clear inputs
            phInput.value = '';
            nh3Input.value = '';
            
            // Reload history
            loadUpdateHistory();
            
            // Auto-clear success message after 3 seconds
            setTimeout(() => {
                if (status) {
                    status.textContent = '';
                    status.className = 'status-message';
                }
            }, 3000);
        } else {
            status.textContent = "❌ Update failed. Please try again.";
            status.className = "status-message status-error";
        }
    } catch (error) {
        status.textContent = "❌ Network error. Please check connection.";
        status.className = "status-message status-error";
    }
}

// Initialize based on current page
function initializePage() {
    console.log('Initializing page...');
    
    // Check which page we're on and call the appropriate function
    if (document.getElementById('tempChart')) {
        console.log('Dashboard page detected');
        loadDashboard();
    } else if (document.getElementById('tempDistribution')) {
        console.log('Stats page detected');
        loadStats();
    } else if (document.getElementById('loginBox')) {
        console.log('Update page detected');
        // Update page - no auto-load needed, waits for login
    }
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}