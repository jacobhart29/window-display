const LOC = { name: "East Brunswick, NJ", lat: 40.4286, lon: -74.4157, tz: "America/New_York" };

function getDayType(date) {
  const ref = new Date(2026, 1, 26);
  const d = new Date(date);
  const diff = Math.floor((d.setHours(0,0,0,0) - ref.setHours(0,0,0,0)) / 8.64e7);
  return (diff % 2 === 0) ? "A Day" : "B Day";
}

const icons = {
  sun: `<svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  cloud: `<svg class="icon-cloud" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  rain: `<svg class="icon-rain" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  snow: `<svg class="icon-snow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></svg>`,
  thunder: `<svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`,
  fog: `<svg class="icon-cloud" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/></svg>`
};

function getCond(c) {
  if (c === 0 || c === 1) return { t: "Clear", i: "sun" };
  if (c === 2 || c === 3) return { t: "Cloudy", i: "cloud" };
  if (c >= 45 && c <= 48) return { t: "Foggy", i: "fog" };
  if (c >= 51 && c <= 67 || c >= 80 && c <= 82) return { t: "Rain", i: "rain" };
  if (c >= 71 && c <= 77 || c >= 85 && c <= 86) return { t: "Snow", i: "snow" };
  if (c >= 95) return { t: "Storm", i: "thunder" };
  return { t: "Cloudy", i: "cloud" };
}

async function update() {
  let n;
  try {
    // Note: WorldTimeAPI can sometimes be unstable; fallback to local time if it fails
    const r = await fetch('https://worldtimeapi.org/api/timezone/' + LOC.tz);
    const d = await r.json();
    n = new Date(d.datetime);
  } catch (e) { 
    n = new Date(); 
  }

  const tStr = n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const [t, p] = tStr.split(' ');
  const [h, m, s] = t.split(':');
  
  document.getElementById('hours').textContent = h;
  document.getElementById('minutes').textContent = m;
  document.getElementById('seconds').textContent = s;
  document.getElementById('period').textContent = p;
  
  const dStr = n.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('date').textContent = dStr + " - " + getDayType(n);
}

async function weather() {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LOC.lat}&longitude=${LOC.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`);
    const d = await r.json();
    const cur = d.current;
    const cond = getCond(cur.weather_code);

    document.getElementById('temp').textContent = Math.round(cur.temperature_2m);
    document.getElementById('condition').textContent = cond.t;
    document.getElementById('feels-like').textContent = Math.round(cur.apparent_temperature);
    document.getElementById('humidity').textContent = cur.relative_humidity_2m;
    document.getElementById('wind').textContent = Math.round(cur.wind_speed_10m);
    
    const visibilityInKm = (cur.visibility || 10000) / 1000;
    document.getElementById('visibility').textContent = Math.round(visibilityInKm * 0.621371);

    document.getElementById('weather-icon').innerHTML = icons[cond.i];

    // Handle background effects
    const rainContainer = document.getElementById('rain-container');
    const snowContainer = document.getElementById('snow-container');
    
    rainContainer.style.display = 'none';
    snowContainer.style.display = 'none';

    if (cond.i === 'rain') {
      rainContainer.innerHTML = ''; 
      rainContainer.style.display = 'block';
      for(let i=0; i<60; i++) {
        const dr = document.createElement('div'); 
        dr.className = 'rain-drop';
        dr.style.left = Math.random()*100+'%'; 
        dr.style.animationDelay = Math.random()*2+'s';
        dr.style.animationDuration = 0.8+Math.random()*0.4+'s'; 
        rainContainer.appendChild(dr);
      }
    } else if (cond.i === 'snow') {
      snowContainer.innerHTML = ''; 
      snowContainer.style.display = 'block';
      for(let i=0; i<50; i++) {
        const f = document.createElement('div'); 
        f.className = 'snowflake';
        const sz = 4+Math.random()*6; 
        f.style.width = sz+'px'; 
        f.style.height = sz+'px';
        f.style.left = Math.random()*100+'%'; 
        f.style.animationDelay = Math.random()*3+'s';
        f.style.animationDuration = 3+Math.random()*2+'s'; 
        snowContainer.appendChild(f);
      }
    }
  } catch (e) {
    console.error("Weather fetch failed", e);
  }
}

// Initialize
update(); 
weather();

// Set intervals
setInterval(update, 1000);
setInterval(weather, 300000); // 5 minutes