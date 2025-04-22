// Assuming countries.json is in the same directory
fetch('countries.json')
  .then(response => response.json())
  .then(data => {
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');

    // Populate country dropdown
    for (const country in data) {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    }

    // Event listener for country selection
    countrySelect.addEventListener('change', () => {
      const cities = data[countrySelect.value];
      citySelect.innerHTML = '<option value="" disabled selected>REQUIRED</option>';
      cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
      citySelect.disabled = false;
    });
  })
  .catch(error => console.error('Error loading countries.json:', error));
