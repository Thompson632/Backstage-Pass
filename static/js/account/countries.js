document.addEventListener("DOMContentLoaded", function () {
    const countries = [
      { abbr: "US", name: "United States" }
    ];
  
    const countrySelect = document.getElementById("country");
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = `${country.name} (${country.abbr})`;
      option.textContent = `${country.name} (${country.abbr})`;
      countrySelect.appendChild(option);
    });
  
    if (userCountry) {
      countrySelect.value = userCountry;
    }
  });
  