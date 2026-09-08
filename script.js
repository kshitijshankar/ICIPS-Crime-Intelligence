/* ==========================================================================
   INDIAN CRIME INTELLIGENCE & PUBLIC SAFETY ANALYTICS - CONTROLLER (JS)
   ========================================================================== */

// 1. Core Config & Global State Store
const DATASET_PATH = 'crime_dataset_india.json.json';
const DATASET_FALLBACK_PATH = 'crime_dataset_india.json';

let g_rawDataset = [];         // Raw parsed objects from JSON
let g_processedDataset = [];   // Cleaned and derived data rows
let g_activeTab = 'executive'; // Active visible dashboard tab

// Slicers state per tab
const g_filters = {
    executive: { city: 'ALL', domain: 'ALL' },
    operations: { city: 'ALL', crime: 'ALL' },
    intelligence: { city: 'ALL', crime: 'ALL' },
    safety: { city: 'ALL', crime: 'ALL' },
    cityrisk: { city: 'ALL', domain: 'ALL' }
};

// ApexCharts registries to prevent duplication and memory leaks
const g_charts = {
    executive: {},
    operations: {},
    intelligence: {},
    safety: {},
    cityrisk: {}
};

// Global Chart configurations matching the Premium Dark Theme
const CHART_THEME_OPTIONS = {
    theme: {
        mode: 'dark',
        palette: 'palette1'
    },
    chart: {
        background: 'transparent',
        foreColor: '#a0aec0',
        fontFamily: "'Outfit', sans-serif",
        toolbar: { show: false },
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 600,
            animateGradually: { enabled: true, delay: 100 },
            dynamicAnimation: { enabled: true, speed: 250 }
        }
    },
    colors: ['#0077b6', '#00b4d8', '#06d6a0', '#f77f00', '#ef4444', '#9c27b0'],
    grid: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
    },
    legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        labels: { colors: '#f8f9fa' },
        markers: { radius: 12 }
    },
    tooltip: {
        theme: 'dark',
        x: { show: true },
        style: {
            fontSize: '12px',
            fontFamily: "'Outfit', sans-serif"
        }
    }
};

// ==========================================================================
// 2. DOCUMENT READY & LIFECYCLE LISTENERS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Cinematic Landing transition
    const btnGoNext = document.getElementById('btn-go-next');
    if (btnGoNext) {
        btnGoNext.addEventListener('click', () => {
            const landingSection = document.getElementById('landing-page');
            landingSection.classList.add('slide-up-out');
            
            // Initiate data load progressively after transition starts
            setTimeout(() => {
                landingSection.classList.add('hidden');
                loadDataset();
            }, 600);
        });
    }

    // Top Sticky Navigation Click Handlers
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = btn.getAttribute('data-tab');
            if (targetTab && targetTab !== g_activeTab) {
                renderTabDashboard(targetTab);
            }
        });
    });

    // Dropdown change listeners
    setupDropdownListeners();
});

// Setup selectors change triggers
function setupDropdownListeners() {
    // Executive dropdowns
    document.getElementById('exec-city').addEventListener('change', (e) => {
        g_filters.executive.city = e.target.value;
        updateExecutiveDashboard();
    });
    document.getElementById('exec-domain').addEventListener('change', (e) => {
        g_filters.executive.domain = e.target.value;
        updateExecutiveDashboard();
    });

    // Operations dropdowns
    document.getElementById('ops-city').addEventListener('change', (e) => {
        g_filters.operations.city = e.target.value;
        updateOperationsDashboard();
    });
    document.getElementById('ops-crime').addEventListener('change', (e) => {
        g_filters.operations.crime = e.target.value;
        updateOperationsDashboard();
    });

    // Intelligence dropdowns
    document.getElementById('intel-city').addEventListener('change', (e) => {
        g_filters.intelligence.city = e.target.value;
        updateIntelligenceDashboard();
    });
    document.getElementById('intel-crime').addEventListener('change', (e) => {
        g_filters.intelligence.crime = e.target.value;
        updateIntelligenceDashboard();
    });

    // Safety dropdowns
    document.getElementById('safety-city').addEventListener('change', (e) => {
        g_filters.safety.city = e.target.value;
        updateSafetyDashboard();
    });
    document.getElementById('safety-crime').addEventListener('change', (e) => {
        g_filters.safety.crime = e.target.value;
        updateSafetyDashboard();
    });

    // City Risk dropdowns
    document.getElementById('risk-city').addEventListener('change', (e) => {
        g_filters.cityrisk.city = e.target.value;
        updateCityRiskDashboard();
    });
    document.getElementById('risk-domain').addEventListener('change', (e) => {
        g_filters.cityrisk.domain = e.target.value;
        updateCityRiskDashboard();
    });
}

// ==========================================================================
// 3. STREAM LOADING & PARSING PIPELINE
// ==========================================================================
async function loadDataset() {
    const loaderOverlay = document.getElementById('loader-overlay');
    const loaderProgressBar = document.getElementById('loader-progress-bar');
    const loaderPercentage = document.getElementById('loader-percentage');
    const loaderStatus = document.getElementById('loader-status');
    
    loaderOverlay.classList.remove('hidden');

    // Priority 1: Check embedded crime dataset from crime_dataset.js
    if (window.CRIME_DATA && window.CRIME_DATA.data && window.CRIME_DATA.data.length > 0) {
        loaderStatus.textContent = "Loading embedded intelligence database...";
        loaderProgressBar.style.width = '35%';
        loaderPercentage.textContent = '35%';
        
        setTimeout(() => {
            g_rawDataset = window.CRIME_DATA.data;
            loaderProgressBar.style.width = '70%';
            loaderPercentage.textContent = '70%';
            loaderStatus.textContent = "Processing 35,000+ crime incident logs...";
            
            setTimeout(() => {
                try {
                    processDataset();
                    loaderProgressBar.style.width = '100%';
                    loaderPercentage.textContent = '100%';
                    loaderStatus.textContent = "Data Loaded Successfully";
                    
                    setTimeout(() => {
                        loaderOverlay.classList.add('hidden');
                        document.getElementById('app-container').classList.remove('hidden');
                        initApplication();
                    }, 300);
                } catch (ex) {
                    console.error("Processing error:", ex);
                    showErrorScreen("Data compilation failed: " + ex.message);
                }
            }, 50);
        }, 80);
        return;
    }

    // Fallback: Streaming fetch if running on a web server without crime_dataset.js
    let response;
    try {
        loaderStatus.textContent = "Connecting to national database...";
        try {
            response = await fetch(DATASET_PATH);
            if (!response.ok) throw new Error("Primary file not found");
        } catch (primaryErr) {
            console.warn(`Primary path '${DATASET_PATH}' failed. Trying fallback...`, primaryErr);
            response = await fetch(DATASET_FALLBACK_PATH);
            if (!response.ok) throw new Error("Fallback file not found");
        }
    } catch (err) {
        console.error("Fetch dataset error:", err);
        showErrorScreen("Please ensure that 'crime_dataset.js' or 'crime_dataset_india.json' exists in the workspace folder.");
        return;
    }
    
    // Estimate content length if header is missing (about 19.6MB)
    const contentLength = +response.headers.get('Content-Length') || 19622442;
    const reader = response.body.getReader();
    let receivedLength = 0;
    let chunks = [];
    
    loaderStatus.textContent = "Streaming reported crime logs...";
    
    try {
        while(true) {
            const {done, value} = await reader.read();
            if (done) break;
            chunks.push(value);
            receivedLength += value.length;
            const percent = Math.min(99, Math.round((receivedLength / contentLength) * 100));
            loaderProgressBar.style.width = percent + '%';
            loaderPercentage.textContent = percent + '%';
        }
    } catch (err) {
        console.error("Stream reader error:", err);
        showErrorScreen("Error occurred while reading the data logs: " + err.message);
        return;
    }
    
    loaderStatus.textContent = "Compiling dataset arrays...";
    loaderProgressBar.style.width = '100%';
    loaderPercentage.textContent = '100%';
    
    // Combine binary chunks
    let chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for(let chunk of chunks) {
        chunksAll.set(chunk, position);
        position += chunk.length;
    }
    
    loaderStatus.textContent = "Parsing JSON tables...";
    
    // Use timeouts to let browser update progress spinner and keep UI fluid
    setTimeout(() => {
        try {
            let resultStr = new TextDecoder("utf-8").decode(chunksAll);
            const dataset = JSON.parse(resultStr);
            g_rawDataset = dataset.data || [];
            
            loaderStatus.textContent = "Deriving operational dimensions...";
            setTimeout(() => {
                try {
                    processDataset();
                    loaderStatus.textContent = "Data Cleansing Complete";
                    setTimeout(() => {
                        loaderOverlay.classList.add('hidden');
                        document.getElementById('app-container').classList.remove('hidden');
                        initApplication();
                    }, 300);
                } catch (ex) {
                    console.error("Processing error:", ex);
                    showErrorScreen("Data compilation failed: " + ex.message);
                }
            }, 50);
            
        } catch (err) {
            console.error("JSON parsing error:", err);
            showErrorScreen("Dataset parsing failed: " + err.message);
        }
    }, 50);
}

function showErrorScreen(details) {
    document.getElementById('loader-overlay').classList.add('hidden');
    document.getElementById('error-overlay').classList.remove('hidden');
    document.getElementById('error-message').textContent = details;
}

// ==========================================================================
// 4. DATA PROCESSING & CLEANSING LAYER (ETL)
// ==========================================================================
function parseIndianDate(dateStr) {
    if (!dateStr || dateStr === 'null' || dateStr === 'N/A' || dateStr === 'None') return null;
    // Format: "DD-MM-YYYY H.MM" or "DD-MM-YYYY HH.MM"
    const parts = dateStr.trim().split(' ');
    if (parts.length === 0) return null;
    const dateParts = parts[0].split('-');
    if (dateParts.length !== 3) return null;
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(dateParts[2], 10);
    
    let hours = 0;
    let minutes = 0;
    if (parts.length > 1) {
        const timeParts = parts[1].includes('.') ? parts[1].split('.') : parts[1].split(':');
        hours = parseInt(timeParts[0], 10) || 0;
        minutes = parseInt(timeParts[1], 10) || 0;
    }
    return new Date(year, month, day, hours, minutes);
}

function deriveTimeOfDay(timeStr) {
    if (!timeStr || timeStr === 'null') return 'Night';
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return 'Night';
    const timeParts = parts[1].includes('.') ? parts[1].split('.') : parts[1].split(':');
    const hour = parseInt(timeParts[0], 10);
    if (isNaN(hour)) return 'Night';
    
    if (hour >= 6 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night'; // covers 21:00-23:59 and 00:00-05:59
}

function deriveAgeGroup(age) {
    if (age === null || age === undefined || isNaN(age)) return 'Unknown';
    if (age <= 17) return '0–17';
    if (age <= 25) return '18–25';
    if (age <= 35) return '26–35';
    if (age <= 45) return '36–45';
    if (age <= 60) return '46–60';
    return '61+';
}

function processDataset() {
    g_processedDataset = g_rawDataset.map((r, index) => {
        const reportedDate = parseIndianDate(r["Date Reported"]);
        const occurrenceDate = parseIndianDate(r["Date of Occurrence"]);
        
        // Parse time and hour
        const timeStr = r["Time of Occurrence"] || "";
        let hour = 0;
        if (timeStr && timeStr.trim().split(' ').length > 1) {
            const tPart = timeStr.trim().split(' ')[1];
            const parts = tPart.includes('.') ? tPart.split('.') : tPart.split(':');
            hour = parseInt(parts[0], 10) || 0;
        } else if (occurrenceDate) {
            hour = occurrenceDate.getHours();
        }
        
        const timeOfDay = deriveTimeOfDay(timeStr);
        
        // Age group derivation
        const age = parseInt(r["Victim Age"]);
        const ageGroup = deriveAgeGroup(isNaN(age) ? null : age);
        
        // Case resolution days calculations
        const isClosed = (r["Case Closed"] || "No").trim();
        const dateClosed = parseIndianDate(r["Date Case Closed"]);
        let resolutionDays = null;
        if (isClosed === "Yes" && dateClosed && reportedDate) {
            const diffTime = dateClosed.getTime() - reportedDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            resolutionDays = diffDays >= 0 ? diffDays : 0;
        }
        
        // Weapons cleansing
        let weapon = (r["Weapon Used"] || "None").trim();
        if (weapon === "" || weapon === "null" || weapon.toLowerCase() === "none") {
            weapon = "No Weapon";
        }
        
        // City and domain standardizations
        let city = (r["City"] || "Unknown").trim();
        let domain = (r["Crime Domain"] || "Other Crime").trim();
        
        // Police deployments calculations
        let police = parseInt(r["Police Deployed"]);
        if (isNaN(police) || police < 0) police = 0;
        
        return {
            reportNumber: r["Report Number"] || (index + 1),
            dateReported: reportedDate,
            dateOccurrence: occurrenceDate,
            hour: hour,
            timeOfDay: timeOfDay,
            city: city,
            crimeCode: r["Crime Code"] || 0,
            crimeDescription: (r["Crime Description"] || "UNKNOWN").trim().toUpperCase(),
            victimAge: isNaN(age) ? null : age,
            victimAgeGroup: ageGroup,
            victimGender: (r["Victim Gender"] || "X").trim().toUpperCase(), // standard default to X
            weaponUsed: weapon,
            crimeDomain: domain,
            policeDeployed: police,
            caseClosed: isClosed,
            dateCaseClosed: dateClosed,
            resolutionDays: resolutionDays,
            yearMonthKey: occurrenceDate ? `${occurrenceDate.getFullYear()}-${String(occurrenceDate.getMonth() + 1).padStart(2, '0')}` : null,
            yearMonthLabel: occurrenceDate ? occurrenceDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'
        };
    });
}

// ==========================================================================
// 5. GLOBAL CONTROLLERS & SLICERS POPULATION
// ==========================================================================
function initApplication() {
    // Generate unique values lists to populate select filters
    const cities = new Set();
    const domains = new Set();
    const crimes = new Set();
    
    g_processedDataset.forEach(r => {
        if (r.city) cities.add(r.city);
        if (r.crimeDomain) domains.add(r.crimeDomain);
        if (r.crimeDescription) crimes.add(r.crimeDescription);
    });
    
    const sortedCities = Array.from(cities).sort();
    const sortedDomains = Array.from(domains).sort();
    const sortedCrimes = Array.from(crimes).sort();
    
    // Populate dropdowns globally
    populateSelect('exec-city', sortedCities);
    populateSelect('exec-domain', sortedDomains);
    
    populateSelect('ops-city', sortedCities);
    populateSelect('ops-crime', sortedCrimes);
    
    populateSelect('intel-city', sortedCities);
    populateSelect('intel-crime', sortedCrimes);
    
    populateSelect('safety-city', sortedCities);
    populateSelect('safety-crime', sortedCrimes);
    
    populateSelect('risk-city', sortedCities);
    populateSelect('risk-domain', sortedDomains);
    
    // Render the initial Executive view
    renderTabDashboard('executive');
}

function populateSelect(elementId, items) {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    // Keep first "ALL" option
    const firstOption = select.options[0];
    select.innerHTML = '';
    select.appendChild(firstOption);
    
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

function getFilteredData(tabName) {
    const filters = g_filters[tabName];
    return g_processedDataset.filter(r => {
        // City Slicer
        if (filters.city !== 'ALL' && r.city !== filters.city) return false;
        
        // Domain Slicer (Executive and City Risk tabs)
        if (filters.domain && filters.domain !== 'ALL' && r.crimeDomain !== filters.domain) return false;
        
        // Crime Slicer (Operations, Intelligence, Safety tabs)
        if (filters.crime && filters.crime !== 'ALL' && r.crimeDescription !== filters.crime) return false;
        
        return true;
    });
}

function resetDashboardFilters(tabName) {
    g_filters[tabName].city = 'ALL';
    if (g_filters[tabName].domain) g_filters[tabName].domain = 'ALL';
    if (g_filters[tabName].crime) g_filters[tabName].crime = 'ALL';
    
    // Reset dropdown values
    if (tabName === 'executive') {
        document.getElementById('exec-city').value = 'ALL';
        document.getElementById('exec-domain').value = 'ALL';
        updateExecutiveDashboard();
    } else if (tabName === 'operations') {
        document.getElementById('ops-city').value = 'ALL';
        document.getElementById('ops-crime').value = 'ALL';
        updateOperationsDashboard();
    } else if (tabName === 'intelligence') {
        document.getElementById('intel-city').value = 'ALL';
        document.getElementById('intel-crime').value = 'ALL';
        updateIntelligenceDashboard();
    } else if (tabName === 'safety') {
        document.getElementById('safety-city').value = 'ALL';
        document.getElementById('safety-crime').value = 'ALL';
        updateSafetyDashboard();
    } else if (tabName === 'cityrisk') {
        document.getElementById('risk-city').value = 'ALL';
        document.getElementById('risk-domain').value = 'ALL';
        updateCityRiskDashboard();
    }
}

// Navigates and loads selected dashboard view
function renderTabDashboard(tabName) {
    g_activeTab = tabName;
    
    // Toggle active classes on nav headers
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Switch views
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        if (tab.id === `tab-${tabName}`) {
            tab.classList.remove('hidden');
        } else {
            tab.classList.add('hidden');
        }
    });
    
    // Force dimensions recalculations & render charts for newly revealed tab
    if (tabName === 'executive') {
        updateExecutiveDashboard();
    } else if (tabName === 'operations') {
        updateOperationsDashboard();
    } else if (tabName === 'intelligence') {
        updateIntelligenceDashboard();
    } else if (tabName === 'safety') {
        updateSafetyDashboard();
    } else if (tabName === 'cityrisk') {
        updateCityRiskDashboard();
    }
}

// ==========================================================================
// 6. DASHBOARDS UPDATE ENGINE
// ==========================================================================

/* --------------------------------------------------------------------------
   DASHBOARD 1: EXECUTIVE OVERVIEW
   -------------------------------------------------------------------------- */
function updateExecutiveDashboard() {
    const data = getFilteredData('executive');
    const totalCrimes = data.length;
    
    // Calculate KPIs
    const closedCases = data.filter(r => r.caseClosed === 'Yes').length;
    const openCases = totalCrimes - closedCases;
    const closureRate = totalCrimes > 0 ? ((closedCases / totalCrimes) * 100).toFixed(1) : '0.0';
    const violentCrimes = data.filter(r => r.crimeDomain === 'Violent Crime').length;
    const violentRate = totalCrimes > 0 ? ((violentCrimes / totalCrimes) * 100).toFixed(1) : '0.0';
    
    const cityCounts = getTopCounts(data, 'city', 1);
    const topCity = cityCounts.length > 0 ? cityCounts[0][0] : 'N/A';
    
    // Push KPIs to interface
    document.getElementById('exec-kpi-total-crimes').textContent = totalCrimes.toLocaleString();
    document.getElementById('exec-kpi-closed-cases').textContent = closedCases.toLocaleString();
    document.getElementById('exec-kpi-open-cases').textContent = openCases.toLocaleString();
    document.getElementById('exec-kpi-closure-rate').textContent = `${closureRate}%`;
    document.getElementById('exec-kpi-violent-rate').textContent = `${violentRate}%`;
    document.getElementById('exec-kpi-top-city').textContent = topCity;
    
    // Handle empty data states
    if (totalCrimes === 0) {
        showEmptyStates('executive');
        renderExecutiveInsights(data);
        return;
    }
    
    // Render charts
    // 1. Crime Trend Over Time (Area/Line)
    const trendData = groupByMonthTrend(data);
    renderTrendChart('exec-chart-trend', 'executive', trendData);
    
    // 2. Top Cities
    const topCities = getTopCounts(data, 'city', 10);
    renderHorizontalBarChart('exec-chart-cities', 'executive', 'cities', topCities.map(x => x[0]), topCities.map(x => x[1]), 'Cases', '#0077b6');
    
    // 3. Domains
    const domains = getTopCounts(data, 'crimeDomain', 5);
    renderDonutChart('exec-chart-domains', 'executive', 'domains', domains.map(x => x[0]), domains.map(x => x[1]));
    
    // 4. Top Crime Types
    const topCrimes = getTopCounts(data, 'crimeDescription', 10);
    renderHorizontalBarChart('exec-chart-types', 'executive', 'types', topCrimes.map(x => x[0]), topCrimes.map(x => x[1]), 'Cases', '#00b4d8');
    
    // 5. Case Status
    renderDonutChart('exec-chart-status', 'executive', 'status', ['Closed Cases', 'Open Cases'], [closedCases, openCases]);
    
    // 6. Genders
    const genders = getTopCounts(data, 'victimGender', 4);
    // Standard labels formatting
    const genderLabels = genders.map(x => x[0] === 'F' ? 'Female' : x[0] === 'M' ? 'Male' : x[0] === 'X' ? 'Other' : x[0]);
    renderDonutChart('exec-chart-gender', 'executive', 'gender', genderLabels, genders.map(x => x[1]));
    
    // Insights generator
    renderExecutiveInsights(data);
}

/* --------------------------------------------------------------------------
   DASHBOARD 2: POLICE OPERATIONS
   -------------------------------------------------------------------------- */
function updateOperationsDashboard() {
    const data = getFilteredData('operations');
    const totalCases = data.length;
    
    // KPIs
    const closed = data.filter(r => r.caseClosed === 'Yes').length;
    const open = totalCases - closed;
    const closureRate = totalCases > 0 ? ((closed / totalCases) * 100).toFixed(1) : '0.0';
    
    let totalPolice = 0;
    data.forEach(r => totalPolice += r.policeDeployed);
    const avgPolice = totalCases > 0 ? (totalPolice / totalCases).toFixed(1) : '0.0';
    
    document.getElementById('ops-kpi-total').textContent = totalCases.toLocaleString();
    document.getElementById('ops-kpi-closed').textContent = closed.toLocaleString();
    document.getElementById('ops-kpi-open').textContent = open.toLocaleString();
    document.getElementById('ops-kpi-closure-rate').textContent = `${closureRate}%`;
    document.getElementById('ops-kpi-total-police').textContent = totalPolice.toLocaleString();
    document.getElementById('ops-kpi-avg-police').textContent = avgPolice;
    
    if (totalCases === 0) {
        showEmptyStates('operations');
        renderOperationsInsights(data);
        return;
    }
    
    // Charts
    // 1. Crime counts by city (Top 10)
    const topCities = getTopCounts(data, 'city', 10);
    renderHorizontalBarChart('ops-chart-crime-city', 'operations', 'crimeCity', topCities.map(x => x[0]), topCities.map(x => x[1]), 'Cases', '#0077b6');
    
    // 2. Police force average deployment by top cities
    const avgPoliceCity = getAvgFieldByField(data, 'city', 'policeDeployed', topCities.map(x => x[0]));
    renderColumnChart('ops-chart-deployment-city', 'operations', 'deployCity', avgPoliceCity.categories, avgPoliceCity.data, 'Avg Police Deployed', '#06d6a0');
    
    // 3. Deployment by Crime Type
    const topCrimes = getTopCounts(data, 'crimeDescription', 10).map(x => x[0]);
    const avgPoliceCrime = getAvgFieldByField(data, 'crimeDescription', 'policeDeployed', topCrimes);
    renderHorizontalBarChart('ops-chart-deployment-crime', 'operations', 'deployCrime', avgPoliceCrime.categories, avgPoliceCrime.data, 'Avg Police', '#00b4d8');
    
    // 4. Backlog Stacked Bar
    const backlogData = getCaseStatusByCity(data);
    renderStackedBarChart('ops-chart-backlog-city', 'operations', 'backlogCity', backlogData.categories, backlogData.series, true, false);
    
    // 5. Operations Trend
    const trendData = groupByMonthTrend(data);
    renderTrendChart('ops-chart-trend', 'operations', trendData);
    
    // 6. Domain vs case status stacked column
    const domainStatusData = getDomainStatus(data);
    renderStackedBarChart('ops-chart-domain-status', 'operations', 'domainStatus', domainStatusData.categories, domainStatusData.series, false, false);
    
    renderOperationsInsights(data);
}

/* --------------------------------------------------------------------------
   DASHBOARD 3: NATIONAL CRIME INTELLIGENCE
   -------------------------------------------------------------------------- */
function updateIntelligenceDashboard() {
    const data = getFilteredData('intelligence');
    const totalCrimes = data.length;
    
    // Compute KPIs
    const uniqueCities = new Set(data.map(r => r.city)).size;
    const uniqueCrimes = new Set(data.map(r => r.crimeDescription)).size;
    const commonCrime = findMode(data.map(r => r.crimeDescription));
    const commonWeapon = findMode(data.map(r => r.weaponUsed));
    
    let totalAge = 0, ageCount = 0;
    data.forEach(r => {
        if (r.victimAge !== null) {
            totalAge += r.victimAge;
            ageCount++;
        }
    });
    const avgAge = ageCount > 0 ? (totalAge / ageCount).toFixed(1) : '0.0';
    
    document.getElementById('intel-kpi-total').textContent = totalCrimes.toLocaleString();
    document.getElementById('intel-kpi-cities').textContent = uniqueCities.toLocaleString();
    document.getElementById('intel-kpi-types').textContent = uniqueCrimes.toLocaleString();
    document.getElementById('intel-kpi-common-crime').textContent = commonCrime;
    document.getElementById('intel-kpi-weapon').textContent = commonWeapon;
    document.getElementById('intel-kpi-avg-age').textContent = avgAge;
    
    if (totalCrimes === 0) {
        showEmptyStates('intelligence');
        document.getElementById('intel-matrix-heatmap').innerHTML = '<tr><td style="padding:40px;">No data available</td></tr>';
        renderIntelligenceInsights(data);
        return;
    }
    
    // Render heatmap matrix dynamically
    renderHeatmapMatrix(data);
    
    // 2. Crime distribution horizontal
    const crimeCounts = getTopCounts(data, 'crimeDescription', 10);
    renderHorizontalBarChart('intel-chart-crime-dist', 'intelligence', 'crimeDist', crimeCounts.map(x => x[0]), crimeCounts.map(x => x[1]), 'Count', '#00b4d8');
    
    // 3. Weapons stacked
    const weaponData = getWeaponByDomainData(data);
    renderStackedBarChart('intel-chart-weapon-crime', 'intelligence', 'weaponCrime', weaponData.categories, weaponData.series, true, false);
    
    // 4. Time of day
    const timeOfDayCounts = getOrderingCounts(data, 'timeOfDay', ['Morning', 'Afternoon', 'Evening', 'Night']);
    renderColumnChart('intel-chart-time-day', 'intelligence', 'timeDay', timeOfDayCounts.categories, timeOfDayCounts.data, 'Crimes', '#f77f00');
    
    // 5. Domain composition by city
    const domainCityData = getDomainByCity(data);
    renderStackedBarChart('intel-chart-domain-city', 'intelligence', 'domainCity', domainCityData.categories, domainCityData.series, false, false);
    
    // 6. Age groups histogram
    const ageCounts = getOrderingCounts(data, 'victimAgeGroup', ['0–17', '18–25', '26–35', '36–45', '46–60', '61+']);
    renderColumnChart('intel-chart-age-dist', 'intelligence', 'ageDist', ageCounts.categories, ageCounts.data, 'Victims', '#06d6a0');
    
    renderIntelligenceInsights(data);
}

/* --------------------------------------------------------------------------
   DASHBOARD 4: WOMEN'S SAFETY & VICTIM ANALYSIS
   -------------------------------------------------------------------------- */
function updateSafetyDashboard() {
    // Slicer filters are applied normally (city & crime description)
    const baseSliceData = getFilteredData('safety');
    
    // Sub-filter: strictly select female victim reports
    const femaleData = baseSliceData.filter(r => r.victimGender === 'F');
    const femaleCases = femaleData.length;
    
    // Calculate female cases percentages (relative to total victim count in slicer bounds)
    const totalCases = baseSliceData.length;
    const femalePercent = totalCases > 0 ? ((femaleCases / totalCases) * 100).toFixed(1) : '0.0';
    
    // Calculations on female subset
    const femaleViolent = femaleData.filter(r => r.crimeDomain === 'Violent Crime').length;
    const femaleOpen = femaleData.filter(r => r.caseClosed === 'No').length;
    const commonCrime = findMode(femaleData.map(r => r.crimeDescription));
    
    const cityCounts = getTopCounts(femaleData, 'city', 1);
    const topCity = cityCounts.length > 0 ? cityCounts[0][0] : 'N/A';
    const topCityCount = cityCounts.length > 0 ? cityCounts[0][1] : 0;
    
    document.getElementById('safety-kpi-cases').textContent = femaleCases.toLocaleString();
    document.getElementById('safety-kpi-percent').textContent = `${femalePercent}%`;
    document.getElementById('safety-kpi-violent').textContent = femaleViolent.toLocaleString();
    document.getElementById('safety-kpi-open').textContent = femaleOpen.toLocaleString();
    document.getElementById('safety-kpi-common-crime').textContent = commonCrime;
    document.getElementById('safety-kpi-top-city').textContent = topCity;
    
    if (femaleCases === 0) {
        showEmptyStates('safety');
        renderSafetyInsights(femaleData, totalCases);
        return;
    }
    
    // Charts on female context
    // 1. Female cases by city (Top 10)
    const fCities = getTopCounts(femaleData, 'city', 10);
    renderHorizontalBarChart('safety-chart-city', 'safety', 'city', fCities.map(x => x[0]), fCities.map(x => x[1]), 'Cases', '#0077b6');
    
    // 2. Female victim age group
    const fAgeCounts = getOrderingCounts(femaleData, 'victimAgeGroup', ['0–17', '18–25', '26–35', '36–45', '46–60', '61+']);
    renderColumnChart('safety-chart-age', 'safety', 'age', fAgeCounts.categories, fAgeCounts.data, 'Cases', '#ef4444');
    
    // 3. Female cases top crime types
    const fCrimes = getTopCounts(femaleData, 'crimeDescription', 10);
    renderHorizontalBarChart('safety-chart-crime', 'safety', 'crime', fCrimes.map(x => x[0]), fCrimes.map(x => x[1]), 'Cases', '#f77f00');
    
    // 4. Comparative stacked bar charts (Victims Genders Male vs Female vs X across top 10 crime codes)
    // NOTE: This chart uses the base slices (unfiltered by gender) to keep comparison active!
    const genderComparison = getGenderByCrime(baseSliceData);
    renderStackedBarChart('safety-chart-gender', 'safety', 'gender', genderComparison.categories, genderComparison.series, true, false);
    
    // 5. Female domain composition
    const fDomains = getTopCounts(femaleData, 'crimeDomain', 5);
    renderDonutChart('safety-chart-domain', 'safety', 'domain', fDomains.map(x => x[0]), fDomains.map(x => x[1]));
    
    // 6. Female 100% case resolution statuses by domain
    const resolutionData = getCaseStatusByDomain100Percent(femaleData);
    renderStackedBarChart('safety-chart-resolution', 'safety', 'resolution', resolutionData.categories, resolutionData.series, true, true);
    
    renderSafetyInsights(femaleData, totalCases);
}

/* --------------------------------------------------------------------------
   DASHBOARD 5: CITY CRIME & RISK PROFILE
   -------------------------------------------------------------------------- */
function updateCityRiskDashboard() {
    const data = getFilteredData('cityrisk');
    const totalCrimes = data.length;
    
    // Calculated KPIs
    const violentCrimes = data.filter(r => r.crimeDomain === 'Violent Crime').length;
    const violentPercent = totalCrimes > 0 ? ((violentCrimes / totalCrimes) * 100).toFixed(1) : '0.0';
    const openCases = data.filter(r => r.caseClosed === 'No').length;
    const closed = totalCrimes - openCases;
    const closureRate = totalCrimes > 0 ? ((closed / totalCrimes) * 100).toFixed(1) : '0.0';
    const commonCrime = findMode(data.map(r => r.crimeDescription));
    
    document.getElementById('risk-kpi-total').textContent = totalCrimes.toLocaleString();
    document.getElementById('risk-kpi-violent').textContent = violentCrimes.toLocaleString();
    document.getElementById('risk-kpi-violent-percent').textContent = `${violentPercent}%`;
    document.getElementById('risk-kpi-open').textContent = openCases.toLocaleString();
    document.getElementById('risk-kpi-closure').textContent = `${closureRate}%`;
    document.getElementById('risk-kpi-common-crime').textContent = commonCrime;
    
    if (totalCrimes === 0) {
        showEmptyStates('cityrisk');
        renderCityRiskInsights(data);
        return;
    }
    
    // 1. City rankings
    const rankings = getTopCounts(data, 'city', 10);
    renderHorizontalBarChart('risk-chart-rank', 'cityrisk', 'rank', rankings.map(x => x[0]), rankings.map(x => x[1]), 'Cases', '#00b4d8');
    
    // 2. City vs domain composition stacked
    const domainCity = getDomainByCity(data);
    renderStackedBarChart('risk-chart-domain', 'cityrisk', 'domain', domainCity.categories, domainCity.series, true, false);
    
    // 3. City vs Case Status stacked columns
    const statusCity = getCaseStatusByCity(data);
    renderStackedBarChart('risk-chart-status', 'cityrisk', 'status', statusCity.categories, statusCity.series, false, false);
    
    // 4. Crimes specific to the selected city context
    const cityCrimes = getTopCounts(data, 'crimeDescription', 10);
    renderColumnChart('risk-chart-top-crimes', 'cityrisk', 'topCrimes', cityCrimes.map(x => x[0]), cityCrimes.map(x => x[1]), 'Cases', '#f77f00');
    
    // 5. Gender comparisons by city
    const genderCity = getGenderByCity(data);
    renderStackedBarChart('risk-chart-demographics', 'cityrisk', 'demographics', genderCity.categories, genderCity.series, true, false);
    
    // 6. Trend over time
    const trendData = groupByMonthTrend(data);
    renderTrendChart('risk-chart-trend', 'cityrisk', trendData);
    
    renderCityRiskInsights(data);
}

// ==========================================================================
// 7. CHART RENDER WRAPPERS (APEXCHARTS INTERFACE)
// ==========================================================================
function safeRenderChart(elementId, tabName, chartKey, options) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Clear HTML block
    container.innerHTML = '';
    
    // Destroy previous instance if registered
    if (g_charts[tabName][chartKey]) {
        try {
            g_charts[tabName][chartKey].destroy();
        } catch(e) {
            console.warn("Chart destroy failed:", e);
        }
        g_charts[tabName][chartKey] = null;
    }
    
    // Re-instantiate
    const chart = new ApexCharts(container, options);
    chart.render();
    g_charts[tabName][chartKey] = chart;
}

function renderTrendChart(elementId, tabName, trendData) {
    const options = {
        ...CHART_THEME_OPTIONS,
        chart: {
            ...CHART_THEME_OPTIONS.chart,
            type: 'area',
            height: 320
        },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.35,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        series: [{ name: 'Cases Reported', data: trendData.data }],
        xaxis: {
            categories: trendData.categories,
            labels: { style: { colors: '#9ca3af' } }
        },
        colors: ['#00b4d8']
    };
    safeRenderChart(elementId, tabName, 'trend', options);
}

function renderHorizontalBarChart(elementId, tabName, chartKey, categories, data, seriesName, color) {
    const options = {
        ...CHART_THEME_OPTIONS,
        chart: {
            ...CHART_THEME_OPTIONS.chart,
            type: 'bar',
            height: 320
        },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '65%',
                borderRadius: 4
            }
        },
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            style: {
                colors: ['#fff'],
                fontSize: '10px',
                fontWeight: 600
            },
            formatter: (val) => val.toLocaleString(),
            offsetX: 6
        },
        series: [{ name: seriesName, data: data }],
        xaxis: {
            categories: categories,
            labels: { formatter: (val) => parseInt(val).toLocaleString() }
        },
        yaxis: {
            labels: {
                maxWidth: 155,
                style: { colors: '#9ca3af' }
            }
        },
        colors: [color]
    };
    safeRenderChart(elementId, tabName, chartKey, options);
}

function renderColumnChart(elementId, tabName, chartKey, categories, data, seriesName, color) {
    const options = {
        ...CHART_THEME_OPTIONS,
        chart: {
            ...CHART_THEME_OPTIONS.chart,
            type: 'bar',
            height: 320
        },
        plotOptions: {
            bar: {
                columnWidth: '55%',
                borderRadius: 4,
                dataLabels: { position: 'top' }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => val % 1 === 0 ? val.toLocaleString() : val.toFixed(1),
            offsetY: -20,
            style: {
                fontSize: '9px',
                colors: ["#a0aec0"]
            }
        },
        series: [{ name: seriesName, data: data }],
        xaxis: {
            categories: categories,
            labels: { style: { colors: '#9ca3af' } }
        },
        yaxis: {
            labels: { style: { colors: '#9ca3af' } }
        },
        colors: [color]
    };
    safeRenderChart(elementId, tabName, chartKey, options);
}

function renderDonutChart(elementId, tabName, chartKey, labels, series) {
    const options = {
        ...CHART_THEME_OPTIONS,
        chart: {
            ...CHART_THEME_OPTIONS.chart,
            type: 'donut',
            height: 320
        },
        labels: labels,
        series: series,
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '13px', fontWeight: 600, color: '#9ca3af' },
                        value: {
                            show: true,
                            fontSize: '18px',
                            fontWeight: 800,
                            color: '#f8f9fa',
                            formatter: (val) => parseInt(val).toLocaleString()
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '12px',
                            color: '#9ca3af',
                            formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString()
                        }
                    }
                }
            }
        }
    };
    safeRenderChart(elementId, tabName, chartKey, options);
}

function renderStackedBarChart(elementId, tabName, chartKey, categories, series, isHorizontal = true, is100Percent = false) {
    const options = {
        ...CHART_THEME_OPTIONS,
        chart: {
            ...CHART_THEME_OPTIONS.chart,
            type: 'bar',
            height: 320,
            stacked: true,
            stackType: is100Percent ? '100%' : 'normal'
        },
        plotOptions: {
            bar: {
                horizontal: isHorizontal,
                columnWidth: '55%',
                barHeight: '70%',
                borderRadius: 4
            }
        },
        series: series,
        xaxis: {
            categories: categories,
            labels: { style: { colors: '#9ca3af' } }
        },
        yaxis: {
            labels: { style: { colors: '#9ca3af' } }
        },
        // Match standard statuses colors: Green for Closed, Red for Open, Blue for Male, Female pink, etc.
        colors: is100Percent || series[0].name === 'Closed' ? ['#06d6a0', '#ef4444', '#0077b6', '#f77f00', '#9c27b0'] : ['#0077b6', '#ef4444', '#f77f00', '#06d6a0', '#9c27b0']
    };
    safeRenderChart(elementId, tabName, chartKey, options);
}

// Renders structured heatmap table using colors and opacity ratios
function renderHeatmapMatrix(data) {
    const container = document.getElementById('intel-matrix-heatmap');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Select top 6 cities and crime descriptions
    const topCities = getTopCounts(data, 'city', 6).map(x => x[0]);
    const topCrimes = getTopCounts(data, 'crimeDescription', 6).map(x => x[0]);
    
    if (topCities.length === 0 || topCrimes.length === 0) {
        container.innerHTML = '<tr><td style="padding:40px;">Matrix compilation requires filtered dimensions</td></tr>';
        return;
    }
    
    const matrix = {};
    let maxCount = 0;
    
    topCrimes.forEach(crime => {
        matrix[crime] = {};
        topCities.forEach(city => {
            matrix[crime][city] = 0;
        });
    });
    
    data.forEach(r => {
        if (matrix[r.crimeDescription] && matrix[r.crimeDescription][r.city] !== undefined) {
            matrix[r.crimeDescription][r.city]++;
            const val = matrix[r.crimeDescription][r.city];
            if (val > maxCount) maxCount = val;
        }
    });
    
    // Build Matrix Header row
    let html = '<thead><tr><th class="corner-cell"><i class="fa-solid fa-file-invoice-dollar"></i> Category \\ City</th>';
    topCities.forEach(city => {
        html += `<th>${city}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Build Matrix Body rows
    topCrimes.forEach(crime => {
        html += `<tr><td class="row-label">${crime}</td>`;
        topCities.forEach(city => {
            const count = matrix[crime][city];
            // Opacity intensity calculation
            const alpha = maxCount > 0 ? (count / maxCount).toFixed(2) : 0;
            const bg = count > 0 ? `rgba(0, 180, 216, ${Math.max(0.1, alpha * 0.75)})` : 'transparent';
            html += `<td class="value-cell" style="background-color: ${bg};" title="${crime} in ${city}: ${count.toLocaleString()} cases">${count.toLocaleString()}</td>`;
        });
        html += '</tr>';
    });
    
    html += '</tbody>';
    container.innerHTML = html;
}

// ==========================================================================
// 8. DATA AGGREGATION UTILITIES
// ==========================================================================
function getTopCounts(data, keyField, limit = 10) {
    const counts = {};
    data.forEach(r => {
        const val = r[keyField];
        if (val !== undefined && val !== null && val !== '') {
            counts[val] = (counts[val] || 0) + 1;
        }
    });
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
}

function getOrderingCounts(data, keyField, orderedLabels) {
    const counts = {};
    orderedLabels.forEach(lbl => counts[lbl] = 0);
    
    data.forEach(r => {
        const val = r[keyField];
        if (counts[val] !== undefined) {
            counts[val]++;
        }
    });
    
    return {
        categories: orderedLabels,
        data: orderedLabels.map(lbl => counts[lbl])
    };
}

function groupByMonthTrend(data) {
    const counts = {};
    data.forEach(r => {
        if (r.yearMonthKey) {
            counts[r.yearMonthKey] = counts[r.yearMonthKey] || { label: r.yearMonthLabel, count: 0 };
            counts[r.yearMonthKey].count++;
        }
    });
    
    // Sort chronological
    const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
    return {
        categories: sorted.map(x => x[1].label),
        data: sorted.map(x => x[1].count)
    };
}

function getAvgFieldByField(data, groupKey, sumKey, filterGroupValues) {
    const sums = {};
    const counts = {};
    
    filterGroupValues.forEach(val => {
        sums[val] = 0;
        counts[val] = 0;
    });
    
    data.forEach(r => {
        const val = r[groupKey];
        if (sums[val] !== undefined) {
            sums[val] += r[sumKey];
            counts[val]++;
        }
    });
    
    const averages = filterGroupValues.map(val => {
        return counts[val] > 0 ? parseFloat((sums[val] / counts[val]).toFixed(1)) : 0;
    });
    
    return {
        categories: filterGroupValues,
        data: averages
    };
}

function getCaseStatusByCity(data, limit = 10) {
    const topCities = getTopCounts(data, 'city', limit).map(x => x[0]);
    const closedData = Array(topCities.length).fill(0);
    const openData = Array(topCities.length).fill(0);
    
    data.forEach(r => {
        const idx = topCities.indexOf(r.city);
        if (idx !== -1) {
            if (r.caseClosed === 'Yes') closedData[idx]++;
            else openData[idx]++;
        }
    });
    return {
        categories: topCities,
        series: [
            { name: 'Closed', data: closedData },
            { name: 'Open', data: openData }
        ]
    };
}

function getDomainStatus(data) {
    const domains = Array.from(new Set(data.map(r => r.crimeDomain))).sort();
    const closedData = Array(domains.length).fill(0);
    const openData = Array(domains.length).fill(0);
    
    data.forEach(r => {
        const idx = domains.indexOf(r.crimeDomain);
        if (idx !== -1) {
            if (r.caseClosed === 'Yes') closedData[idx]++;
            else openData[idx]++;
        }
    });
    return {
        categories: domains,
        series: [
            { name: 'Closed', data: closedData },
            { name: 'Open', data: openData }
        ]
    };
}

function getDomainByCity(data, limit = 10) {
    const topCities = getTopCounts(data, 'city', limit).map(x => x[0]);
    const domains = Array.from(new Set(data.map(r => r.crimeDomain))).sort();
    
    const series = domains.map(domain => {
        const counts = topCities.map(city => {
            return data.filter(r => r.city === city && r.crimeDomain === domain).length;
        });
        return { name: domain, data: counts };
    });
    return { categories: topCities, series: series };
}

function getWeaponByDomainData(data, limitWeapons = 5) {
    const domains = Array.from(new Set(data.map(r => r.crimeDomain))).sort();
    const topWeapons = getTopCounts(data, 'weaponUsed', limitWeapons).map(x => x[0]);
    
    const weaponSeriesData = {};
    topWeapons.forEach(w => {
        weaponSeriesData[w] = Array(domains.length).fill(0);
    });
    const otherSeriesData = Array(domains.length).fill(0);
    
    data.forEach(r => {
        const domIdx = domains.indexOf(r.crimeDomain);
        if (domIdx !== -1) {
            if (topWeapons.includes(r.weaponUsed)) {
                weaponSeriesData[r.weaponUsed][domIdx]++;
            } else {
                otherSeriesData[domIdx]++;
            }
        }
    });
    
    const series = Object.entries(weaponSeriesData).map(([name, counts]) => ({
        name: name,
        data: counts
    }));
    if (otherSeriesData.some(x => x > 0)) {
        series.push({ name: 'Other', data: otherSeriesData });
    }
    return { categories: domains, series: series };
}

function getGenderByCrime(data, limitCrimes = 10) {
    const topCrimes = getTopCounts(data, 'crimeDescription', limitCrimes).map(x => x[0]);
    const genders = ['M', 'F', 'X'];
    
    const series = genders.map(gender => {
        const counts = topCrimes.map(crime => {
            return data.filter(r => r.crimeDescription === crime && r.victimGender === gender).length;
        });
        
        let label = 'Other (X)';
        if (gender === 'M') label = 'Male';
        if (gender === 'F') label = 'Female';
        return { name: label, data: counts };
    });
    return { categories: topCrimes, series: series };
}

function getGenderByCity(data, limitCities = 10) {
    const topCities = getTopCounts(data, 'city', limitCities).map(x => x[0]);
    const genders = ['M', 'F', 'X'];
    
    const series = genders.map(gender => {
        const counts = topCities.map(city => {
            return data.filter(r => r.city === city && r.victimGender === gender).length;
        });
        
        let label = 'Other (X)';
        if (gender === 'M') label = 'Male';
        if (gender === 'F') label = 'Female';
        return { name: label, data: counts };
    });
    return { categories: topCities, series: series };
}

function getCaseStatusByDomain100Percent(data) {
    const domains = Array.from(new Set(data.map(r => r.crimeDomain))).sort();
    const closedData = Array(domains.length).fill(0);
    const openData = Array(domains.length).fill(0);
    
    data.forEach(r => {
        const idx = domains.indexOf(r.crimeDomain);
        if (idx !== -1) {
            if (r.caseClosed === 'Yes') closedData[idx]++;
            else openData[idx]++;
        }
    });
    return {
        categories: domains,
        series: [
            { name: 'Closed', data: closedData },
            { name: 'Open', data: openData }
        ]
    };
}

function findMode(arr) {
    if (arr.length === 0) return 'N/A';
    const freqs = {};
    let max = 0;
    let mode = 'N/A';
    arr.forEach(val => {
        if (val === null || val === undefined || val === '') return;
        freqs[val] = (freqs[val] || 0) + 1;
        if (freqs[val] > max) {
            max = freqs[val];
            mode = val;
        }
    });
    return mode;
}

function showEmptyStates(tabName) {
    const tabSection = document.getElementById(`tab-${tabName}`);
    if (!tabSection) return;
    tabSection.querySelectorAll('.chart-body').forEach(body => {
        body.innerHTML = `
            <div class="chart-empty-state">
                <i class="fa-solid fa-circle-nodes"></i>
                <h4>No Data for Current Slicers</h4>
                <p>No incidents match the active filters. Reset filters to explore other subsets.</p>
            </div>`;
    });
}

// ==========================================================================
// 9. DYNAMIC DOCKET/INSIGHTS GENERATOR (HANDWRITTEN STYLE)
// ==========================================================================

function createInsightCard(idNum, text) {
    return `
        <div class="insight-card">
            <div class="insight-header">✍ INSIGHT 0${idNum}</div>
            <div class="insight-body">${text}</div>
        </div>`;
}

// Executive overview insights
function renderExecutiveInsights(data) {
    const container = document.getElementById('exec-insights');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = createInsightCard(1, "No data available in the current slice. Please adjust selectors.");
        return;
    }
    
    const cityCounts = getTopCounts(data, 'city', 1);
    const topCityName = cityCounts.length > 0 ? cityCounts[0][0] : 'N/A';
    const topCityCases = cityCounts.length > 0 ? cityCounts[0][1] : 0;
    
    const closed = data.filter(r => r.caseClosed === 'Yes').length;
    const closedPercent = ((closed / data.length) * 100).toFixed(1);
    const openPercent = (100 - parseFloat(closedPercent)).toFixed(1);
    
    const commonCrime = findMode(data.map(r => r.crimeDescription));
    const commonDomain = findMode(data.map(r => r.crimeDomain));
    
    let html = '';
    html += createInsightCard(1, `<strong>${topCityName}</strong> registered the highest volume of crimes within this slice, reporting <strong>${topCityCases.toLocaleString()}</strong> incidents.`);
    html += createInsightCard(2, `The metrics show <strong>${closedPercent}%</strong> of reported cases are resolved and closed, while <strong>${openPercent}%</strong> remain open under active inquiry.`);
    html += createInsightCard(3, `Category analysis reveals <strong>${commonCrime}</strong> is the most frequently recorded offense across these cities.`);
    html += createInsightCard(4, `The <strong>${commonDomain}</strong> sector contributes the largest share of reported incidents, indicating critical areas for tactical focus.`);
    
    container.innerHTML = container.innerHTML = html;
}

// Operational insights
function renderOperationsInsights(data) {
    const container = document.getElementById('ops-insights');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = createInsightCard(1, "No operational data in the current context.");
        return;
    }
    
    const cityCounts = getTopCounts(data, 'city', 2);
    const highestWorkloadCity = cityCounts.length > 0 ? cityCounts[0][0] : 'N/A';
    const highestWorkloadCases = cityCounts.length > 0 ? cityCounts[0][1] : 0;
    
    // Highest open cases volume
    const openCasesByCity = {};
    data.forEach(r => {
        if (r.caseClosed === 'No') {
            openCasesByCity[r.city] = (openCasesByCity[r.city] || 0) + 1;
        }
    });
    const highestOpenCity = Object.entries(openCasesByCity).sort((a,b)=>b[1]-a[1])[0];
    const openCityName = highestOpenCity ? highestOpenCity[0] : 'N/A';
    const openCityCases = highestOpenCity ? highestOpenCity[1] : 0;
    
    // Highest average deployment crime type
    const crimeCounts = getTopCounts(data, 'crimeDescription', 20).map(x => x[0]);
    const avgPoliceCrime = getAvgFieldByField(data, 'crimeDescription', 'policeDeployed', crimeCounts);
    let maxIdx = -1, maxVal = 0;
    avgPoliceCrime.data.forEach((val, idx) => {
        if (val > maxVal) {
            maxVal = val;
            maxIdx = idx;
        }
    });
    const highDeployCrime = maxIdx !== -1 ? avgPoliceCrime.categories[maxIdx] : 'N/A';
    
    const commonDomain = findMode(data.map(r => r.crimeDomain));
    
    let html = '';
    html += createInsightCard(1, `<strong>${highestWorkloadCity}</strong> imposes the heaviest operational load, representing <strong>${highestWorkloadCases.toLocaleString()}</strong> active cases in the system.`);
    html += createInsightCard(2, `Backlog analysis locates the greatest volume of unresolved cases in <strong>${openCityName}</strong>, with <strong>${openCityCases.toLocaleString()}</strong> investigations pending.`);
    html += createInsightCard(3, `Deployment data highlights <strong>${highDeployCrime}</strong> as requiring the highest average police force allocation, with <strong>${maxVal}</strong> officers per case.`);
    html += createInsightCard(4, `Investigations in the <strong>${commonDomain}</strong> domain constitute the largest share of ongoing case files requiring division resource deployment.`);
    
    container.innerHTML = html;
}

// Intelligence insights
function renderIntelligenceInsights(data) {
    const container = document.getElementById('intel-insights');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = createInsightCard(1, "No data available in the current slice.");
        return;
    }
    
    const commonCrime = findMode(data.map(r => r.crimeDescription));
    const commonWeapon = findMode(data.map(r => r.weaponUsed));
    const commonTime = findMode(data.map(r => r.timeOfDay));
    const commonAge = findMode(data.map(r => r.victimAgeGroup));
    
    // Find city with maximum frequency of common crime
    const commonCrimeData = data.filter(r => r.crimeDescription === commonCrime);
    const cityCounts = getTopCounts(commonCrimeData, 'city', 1);
    const concentrationCity = cityCounts.length > 0 ? cityCounts[0][0] : 'N/A';
    const concentrationCount = cityCounts.length > 0 ? cityCounts[0][1] : 0;
    
    let html = '';
    html += createInsightCard(1, `Frequency calculations identify <strong>${commonCrime}</strong> as the dominant category, representing the highest count in the current metrics.`);
    html += createInsightCard(2, `Geographic cluster analyses show a strong concentration of ${commonCrime} in <strong>${concentrationCity}</strong>, representing <strong>${concentrationCount}</strong> specific reports.`);
    html += createInsightCard(3, `Tool profiles identify <strong>${commonWeapon}</strong> as the most common instrument used in reported incident commissions.`);
    html += createInsightCard(4, `Temporal analysis marks the <strong>${commonTime}</strong> hours as registering the largest volume of crime reports. Victims in the <strong>${commonAge}</strong> age bracket appear most frequently.`);
    
    container.innerHTML = html;
}

// Women's Safety insights
function renderSafetyInsights(femaleData, totalCases) {
    const container = document.getElementById('safety-insights');
    if (!container) return;
    
    if (femaleData.length === 0) {
        container.innerHTML = createInsightCard(1, "No reported incidents involving female victims in the active context.");
        return;
    }
    
    const femaleCases = femaleData.length;
    const femalePercent = totalCases > 0 ? ((femaleCases / totalCases) * 100).toFixed(1) : '0.0';
    
    const cityCounts = getTopCounts(femaleData, 'city', 1);
    const topCity = cityCounts.length > 0 ? cityCounts[0][0] : 'N/A';
    const topCityCount = cityCounts.length > 0 ? cityCounts[0][1] : 0;
    
    const commonCrime = findMode(femaleData.map(r => r.crimeDescription));
    const commonAge = findMode(femaleData.map(r => r.victimAgeGroup));
    
    const violentCount = femaleData.filter(r => r.crimeDomain === 'Violent Crime').length;
    const violentPercent = femaleCases > 0 ? ((violentCount / femaleCases) * 100).toFixed(1) : '0.0';
    
    const openCount = femaleData.filter(r => r.caseClosed === 'No').length;
    
    let html = '';
    html += createInsightCard(1, `Reported incidents with female victims total <strong>${femaleCases.toLocaleString()}</strong>, representing <strong>${femalePercent}%</strong> of overall cases in this selection.`);
    html += createInsightCard(2, `Geographically, <strong>${topCity}</strong> reported the largest share of cases involving female victims, recording <strong>${topCityCount.toLocaleString()}</strong> files.`);
    html += createInsightCard(3, `Analysis indicates <strong>${commonCrime}</strong> is the most common crime type involving female victims, with the <strong>${commonAge}</strong> demographic appearing most frequently.`);
    html += createInsightCard(4, `Violent crimes represent <strong>${violentPercent}%</strong> of the female victim reports, with <strong>${openCount.toLocaleString()}</strong> cases remaining unresolved under active investigation.`);
    
    container.innerHTML = html;
}

// City Risk profile insights
function renderCityRiskInsights(data) {
    const container = document.getElementById('risk-insights');
    if (!container) return;
    
    if (data.length === 0) {
        container.innerHTML = createInsightCard(1, "No data available in the current context.");
        return;
    }
    
    const rankCounts = getTopCounts(data, 'city', 2);
    const topCity = rankCounts.length > 0 ? rankCounts[0][0] : 'N/A';
    const topCityCount = rankCounts.length > 0 ? rankCounts[0][1] : 0;
    
    // Find city with highest violent crime share
    const cities = Array.from(new Set(data.map(r => r.city)));
    let maxViolentShare = 0;
    let violentCity = 'N/A';
    
    cities.forEach(city => {
        const cityData = data.filter(r => r.city === city);
        if (cityData.length >= 10) { // Limit to cities with at least 10 crimes for statistical validity
            const violent = cityData.filter(r => r.crimeDomain === 'Violent Crime').length;
            const share = violent / cityData.length;
            if (share > maxViolentShare) {
                maxViolentShare = share;
                violentCity = city;
            }
        }
    });
    
    // Find city with highest open cases count
    const openCasesByCity = {};
    data.forEach(r => {
        if (r.caseClosed === 'No') {
            openCasesByCity[r.city] = (openCasesByCity[r.city] || 0) + 1;
        }
    });
    const highestOpen = Object.entries(openCasesByCity).sort((a,b)=>b[1]-a[1])[0];
    const backlogCity = highestOpen ? highestOpen[0] : 'N/A';
    const backlogCount = highestOpen ? highestOpen[1] : 0;
    
    // Compute city closure rates
    let maxClosure = 0, minClosure = 100;
    let bestCity = 'N/A', worstCity = 'N/A';
    
    cities.forEach(city => {
        const cityData = data.filter(r => r.city === city);
        if (cityData.length >= 10) {
            const closed = cityData.filter(r => r.caseClosed === 'Yes').length;
            const rate = (closed / cityData.length) * 100;
            if (rate > maxClosure) {
                maxClosure = rate;
                bestCity = city;
            }
            if (rate < minClosure) {
                minClosure = rate;
                worstCity = city;
            }
        }
    });
    
    let html = '';
    html += createInsightCard(1, `The city reporting the highest aggregate crime volume in this slice is <strong>${topCity}</strong>, with <strong>${topCityCount.toLocaleString()}</strong> registered cases.`);
    
    if (violentCity !== 'N/A') {
        html += createInsightCard(2, `Proportionally, <strong>${violentCity}</strong> shows the highest concentration of violent crimes, representing <strong>${(maxViolentShare * 100).toFixed(1)}%</strong> of its local caseload.`);
    } else {
        html += createInsightCard(2, "Violent crime concentrations remain evenly distributed across reporting municipalities in this slice.");
    }
    
    html += createInsightCard(3, `Case backlog is highest in <strong>${backlogCity}</strong>, where <strong>${backlogCount.toLocaleString()}</strong> investigations remain open and unresolved.`);
    
    if (bestCity !== 'N/A' && worstCity !== 'N/A') {
        html += createInsightCard(4, `Performance audits mark <strong>${bestCity}</strong> with the highest closure rate (<strong>${maxClosure.toFixed(1)}%</strong>) and <strong>${worstCity}</strong> with the lowest (<strong>${minClosure.toFixed(1)}%</strong>) among cities with active filings.`);
    } else {
        html += createInsightCard(4, "Caseload closure rates appear consistent across municipal commands in this selection.");
    }
    
    container.innerHTML = html;
}
