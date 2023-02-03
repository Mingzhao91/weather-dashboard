const APP_ID = "weather-dashboard";
const API_KEY = "6a1575051b1bc2d3c0c021d12e30be02";

// get the geocoding url by providing the city
function getLocationUrl(city, apiKey = API_KEY) {
  return `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
}

// get the 5-days weather forcast url by providing the latitude and the longitude
function getWeatherForecastUrl(lat, lon, apiKey = API_KEY) {
  return `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
}

// get weather png using icon code from https://openweathermap.org/weather-conditions
function getWeatherIconUrl(weatherIcon) {
  return `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;
}

// get citys from local storage
function getCitysFromLocalStorage() {
  // get local storage, if it's null then create a new object
  let citysArr = localStorage.getItem(APP_ID)
    ? JSON.parse(localStorage.getItem(APP_ID))
    : [];
  return citysArr;
}

// save a city to local storage
function saveCityToLocalStorage(city) {
  // get local storage, if it's null then create a new object
  let citysArr = localStorage.getItem(APP_ID)
    ? JSON.parse(localStorage.getItem(APP_ID))
    : [];

  const cityIndex = citysArr.indexOf(city);

  if (cityIndex < 0) {
    // city isn't in the array, append city to the front of the array
    citysArr.unshift(city);
  } else if (cityIndex > 0) {
    // city is in the array, bring it to the front of the array
    citysArr.splice(cityIndex, 1);
    citysArr.unshift(city);
  }

  // save an event into local storage
  localStorage.setItem(APP_ID, JSON.stringify(citysArr));
}

// get geographical cooridnates of city and the weather forecast
async function onSearchButtonClick(event) {
  event.preventDefault();
  // get city from user input
  const city = $("#search-input").val();

  // make API call only if city isn't empty
  if (city.trim().length > 0) {
    const geolocationResp = await $.ajax({
      method: "GET",
      url: getLocationUrl(city)
    });

    // store location and get weather based on the location
    if (geolocationResp && geolocationResp.length > 0) {
      // get the first result from the array as the location
      const location = geolocationResp[0];
      const locationName = location.name;
    }
  }
}

$("#search-button").on("click", onSearchButtonClick);

// $.ajax({
//   method: "GET",
//   url: getLocationUrl("london")
// }).then((resp) => {
//   console.log("london", resp);
// });

// $.ajax({
//   method: "GET",
//   url: getWeatherForecastUrl(51.5073219, -0.1276474)
// }).then((resp) => {
//   console.log("weather", resp);
// });
