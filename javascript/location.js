// Load both JSON files
Promise.all([
  fetch('../data/countryNames.json').then(response => response.json()),  // Country code to country name mapping
  fetch('../data/cities.json').then(response => response.json())       // City data with country codes
])
  .then(([countryNames, citiesData]) => {
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');

    // Populate country dropdown using countryNames.json
    Object.keys(countryNames).forEach(countryCode => {
      const country = countryNames[countryCode]; // Get country name using country code
      const option = document.createElement('option');
      option.value = countryCode;  // Set country code as value
      option.textContent = country; // Display country name
      countrySelect.appendChild(option);
    });

    // Event listener for country selection
    countrySelect.addEventListener('change', () => {
      const selectedCountryCode = countrySelect.value;
      const cities = citiesData.filter(city => city.country === selectedCountryCode); // Filter cities for selected country
      citySelect.innerHTML = '<option value="" disabled selected>REQUIRED</option>'; // Reset city dropdown

      // Populate city dropdown based on selected country
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.name; // Set city name as value
        option.textContent = city.name; // Display city name
        citySelect.appendChild(option);
      });
      
      // Enable the city dropdown once a country is selected
      citySelect.disabled = false;
    });
  })
  .catch(error => console.error('Error loading countries or cities data:', error));