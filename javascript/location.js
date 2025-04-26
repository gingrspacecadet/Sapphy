// Load both JSON files from the /data folder
Promise.all([
  fetch('/data/countryNames.json').then(r => r.json()),  // Country code → full name
  fetch('/data/cities.json').then(r => r.json())         // Array of city objects
])
  .then(([countryNames, citiesData]) => {
    const countrySelect = document.getElementById('country');
    const citySelect    = document.getElementById('city');

    // Prepare & sort country codes by their display name
    const sortedCountryCodes = Object.keys(countryNames)
      .sort((a, b) => countryNames[a].localeCompare(countryNames[b]));

    // Populate the country dropdown
    countrySelect.innerHTML = '<option value="" disabled selected>– Country –</option>';
    sortedCountryCodes.forEach(code => {
      const opt = document.createElement('option');
      opt.value       = code;
      opt.textContent = countryNames[code];
      countrySelect.appendChild(opt);
    });

    // When a country is selected, populate its cities
    countrySelect.addEventListener('change', () => {
      const sel = countrySelect.value;
      // Filter & sort cities for this country
      const cities = citiesData
        .filter(c => c.country === sel)
        .sort((a, b) => a.name.localeCompare(b.name));

      // Reset city dropdown
      citySelect.innerHTML = '<option value="" disabled selected>– City –</option>';
      citySelect.disabled  = false;

      cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value       = city.name;
        opt.textContent = city.name;
        citySelect.appendChild(opt);
      });
    });
  })
  .catch(err => console.error('Error loading JSON data:', err));