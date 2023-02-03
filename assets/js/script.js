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

// show weather in DOM
function showWeather(weather) {
  console.log("weather: ", weather);
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
      const city = location.name;
      saveCityToLocalStorage(city);

      // get weather for the city
      const weather = await $.ajax({
        method: "GET",
        url: getWeatherForecastUrl(location.lat, location.lon)
      });

      if (weather) {
        showWeather(weather);
      } else {
        // TODO: show popup to say weather can't be found
      }
    } else {
      // TODO: show popup to say city can't be found
    }
  }
}

$("#search-button").on("click", onSearchButtonClick);

// get cities that are stored from local storage and show them to the DOM
function populateCityHistory() {
  const citysArr = getCitysFromLocalStorage();
  console.log("citysArr: ", citysArr);

  // clear previous citys in the DOM
  $("#history").empty();

  // build a list of citys and show to the DOM
  if (citysArr && citysArr.length > 0) {
    citysArr.forEach(function (city) {
      const cityTab = $('<button class="btn btn-secondary mb-2">');
      cityTab.text(city);
      $("#history").append(cityTab);
    });
  }
}

// function to run when app get started
function start() {
  populateCityHistory();
}

start();

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
