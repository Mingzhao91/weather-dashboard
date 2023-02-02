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

$.ajax({
  method: "GET",
  url: getLocationUrl("london")
}).then((resp) => {
  console.log("london", resp);
});

$.ajax({
  method: "GET",
  url: getWeatherForecastUrl(51.5073219, -0.1276474)
}).then((resp) => {
  console.log("weather", resp);
});

$.ajax({
  method: "GET",
  url: `http://api.openweathermap.org/data/2.5/forecast?q=${"london"}&appid=${API_KEY}`
}).then((resp) => {
  console.log("MIX", resp);
});
