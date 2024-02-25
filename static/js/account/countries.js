document.addEventListener("DOMContentLoaded", function () {
    const countries = [
      { abbr: "US", name: "United States" }
    ];
  
    const countrySelect = document.getElementById("country");
    
    for (const country of countries) {
      const option = document.createElement("option");
      option.value = `${country.name} (${country.abbr})`;
      option.textContent = `${country.name} (${country.abbr})`;
      countrySelect.appendChild(option);
    };
  
    if (userCountry) {
      countrySelect.value = userCountry;
    }
  });
  