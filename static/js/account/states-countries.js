document.addEventListener("DOMContentLoaded", function () {
  const states = [
    { abbr: "AL", name: "Alabama" },
    { abbr: "AK", name: "Alaska" },
    { abbr: "AZ", name: "Arizona" },
    { abbr: "AR", name: "Arkansas" },
    { abbr: "CA", name: "California" },
    { abbr: "CO", name: "Colorado" },
    { abbr: "CT", name: "Connecticut" },
    { abbr: "DE", name: "Delaware" },
    { abbr: "FL", name: "Florida" },
    { abbr: "GA", name: "Georgia" },
    { abbr: "HI", name: "Hawaii" },
    { abbr: "ID", name: "Idaho" },
    { abbr: "IL", name: "Illinois" },
    { abbr: "IN", name: "Indiana" },
    { abbr: "IA", name: "Iowa" },
    { abbr: "KS", name: "Kansas" },
    { abbr: "KY", name: "Kentucky" },
    { abbr: "LA", name: "Louisiana" },
    { abbr: "ME", name: "Maine" },
    { abbr: "MD", name: "Maryland" },
    { abbr: "MA", name: "Massachusetts" },
    { abbr: "MI", name: "Michigan" },
    { abbr: "MN", name: "Minnesota" },
    { abbr: "MS", name: "Mississippi" },
    { abbr: "MO", name: "Missouri" },
    { abbr: "MT", name: "Montana" },
    { abbr: "NE", name: "Nebraska" },
    { abbr: "NV", name: "Nevada" },
    { abbr: "NH", name: "New Hampshire" },
    { abbr: "NJ", name: "New Jersey" },
    { abbr: "NM", name: "New Mexico" },
    { abbr: "NY", name: "New York" },
    { abbr: "NC", name: "North Carolina" },
    { abbr: "ND", name: "North Dakota" },
    { abbr: "OH", name: "Ohio" },
    { abbr: "OK", name: "Oklahoma" },
    { abbr: "OR", name: "Oregon" },
    { abbr: "PA", name: "Pennsylvania" },
    { abbr: "RI", name: "Rhode Island" },
    { abbr: "SC", name: "South Carolina" },
    { abbr: "SD", name: "South Dakota" },
    { abbr: "TN", name: "Tennessee" },
    { abbr: "TX", name: "Texas" },
    { abbr: "UT", name: "Utah" },
    { abbr: "VT", name: "Vermont" },
    { abbr: "VA", name: "Virginia" },
    { abbr: "WA", name: "Washington" },
    { abbr: "WV", name: "West Virginia" },
    { abbr: "WI", name: "Wisconsin" },
    { abbr: "WY", name: "Wyoming" },
  ];

  const countries = [{ abbr: "US", name: "United States" }];

  const stateSelect = document.getElementById("state");
  const countrySelect = document.getElementById("country");

  for (const state of states) {
    const option = document.createElement("option");
    option.value = `${state.name} (${state.abbr})`;
    option.textContent = `${state.name} (${state.abbr})`;
    stateSelect.appendChild(option);
  }

  if (userState) {
    stateSelect.value = userState;
    stateSelect.dataset.initialValue = userState;
  }

  for (const country of countries) {
    const option = document.createElement("option");
    option.value = `${country.name} (${country.abbr})`;
    option.textContent = `${country.name} (${country.abbr})`;
    countrySelect.appendChild(option);
  }

  if (userCountry) {
    countrySelect.value = userCountry;
    countrySelect.dataset.initialValue = userCountry;
  }
});
