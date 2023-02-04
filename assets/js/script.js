const APP_ID = "weather-dashboard";
const API_KEY = "6a1575051b1bc2d3c0c021d12e30be02";

// get the geocoding url by providing the city
function getLocationUrl(city, apiKey = API_KEY) {
  return `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
}

// get the 5-days weather forcast url by providing the latitude and the longitude
function get5DaysWeatherForecastUrl(lat, lon, apiKey = API_KEY) {
  return `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
}

function getCurrentWeatherForecastUrl(lat, lon, apiKey = API_KEY) {
  return `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
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

function convertKelvinToCelsicus(kelvin) {
  return (kelvin - 273.15).toFixed(2);
}

function convertMeterPerSecToKiloMeterPerHour(meterPerSec) {
  return (meterPerSec * 3.6).toFixed(2);
}

// build the element for today weather and put it into the DOM
function showTodayWeather(resp, city) {
  const todayEl$ = $("#today");

  // clear previous result
  todayEl$.empty();
  // add class to today div
  todayEl$.addClass("today--show");

  // 1 kelvin = -273.15 degree celsicus
  // 1 meter per second = 3.6 kilometer per hour

  // insert weather information in the DOM
  todayEl$.html(`
    <div class="today-header d-flex align-items-center">
      <h2 class="today-city">${city} (${moment().format("DD/M/YYYY")})</h2>
      <img src="${getWeatherIconUrl(resp.weather[0].icon)}" />
    </div>
    <div class="today-body">
      <p class="today-body__item">Temp: ${convertKelvinToCelsicus(
        resp.main.temp
      )} &#8451;</p> 
      <p class="today-body__item">Wind: ${convertMeterPerSecToKiloMeterPerHour(
        resp.wind.speed
      )} KPH</p>
      <p class="today-body__item">Humidity: ${resp.main.humidity}%</p>
    </div>
`);
}

// build the element for weather in 5 days and put it into the DOM
function show5DaysWeather(resp) {
  const forecastEl = $("#forecast");
  // clear previous result
  forecastEl.empty();

  // get tomorrow date
  const tomorrowDate = moment().add("days", 1).startOf("day");

  // setup header and body element in forecast div
  const forecastHeaderEl = $('<div class="forecast-header">');
  forecastHeaderEl.text("5-Day Forecast:");
  const forecastBodyEl = $('<div class="forecast-body">');

  for (let day = 0; day < 5; day++) {
    const startDate = moment(tomorrowDate).add("days", day);
    const endDate = moment(tomorrowDate).add("days", day + 1);

    // get weather for each day
    const weatherPerDayArr = resp.list.filter(
      (weather) =>
        moment.unix(weather.dt) >= startDate &&
        moment.unix(weather.dt) < endDate
    );
    // console.log("weatherPerDayArr: ", weatherPerDayArr);

    // get average temperature
    const avgTemp = `${convertKelvinToCelsicus(
      weatherPerDayArr.reduce((prev, curr) => prev + curr.main.temp, 0) /
        weatherPerDayArr.length
    )}`;

    // get average wind speed
    const avgWind = `${convertMeterPerSecToKiloMeterPerHour(
      weatherPerDayArr.reduce((prev, curr) => prev + curr.wind.speed, 0) /
        weatherPerDayArr.length
    )}`;

    // get average humidity
    const avgHumidity = `${(
      weatherPerDayArr.reduce((prev, curr) => prev + curr.main.humidity, 0) /
      weatherPerDayArr.length
    ).toFixed(0)}`;

    const cardEl = $('<div class="forecast-card">');
    cardEl.html(`      
      <h3 class="forecast-card__date">${startDate.format("DD/M/YYYY")}</h3>
      <img src="${getWeatherIconUrl(
        weatherPerDayArr[0].weather[0].icon
      )}" class="forecast-card__img"></img>
      <div class="forecast-card__item">Temp: ${avgTemp} &#8451;</div>
      <div class="forecast-card__item">Wind: ${avgWind} KPH</div>
      <div class="forecast-card__item">Humidity: ${avgHumidity}%</div>
    `);
    forecastBodyEl.append(cardEl);
  }

  forecastEl.append(forecastHeaderEl);
  forecastEl.append(forecastBodyEl);
}

// get geographical cooridnates of city and the weather forecast
async function getWeather(event) {
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
      populateCityHistory();

      // get current day weather for the city
      const weatherCurrentResp = await $.ajax({
        method: "GET",
        url: getCurrentWeatherForecastUrl(location.lat, location.lon)
      });
      showTodayWeather(weatherCurrentResp, city);

      // get 5-days weather for the city
      const weather5DaysResp = await $.ajax({
        method: "GET",
        url: get5DaysWeatherForecastUrl(location.lat, location.lon)
      });
      show5DaysWeather(weather5DaysResp);
    } else {
      // update text in model
      $("#city-modal-body").text(`${city} can't be found! Please try again.`);
      $("#city-modal").modal("show");
    }
  } else {
    showInputPopover();
  }
}

async function onCityBtnClick(event) {
  event.preventDefault();
  // get city from the button data attribute
  const city = $(event.target).attr("data-city");
  // put the city in the search input
  $("#search-input").val(city);
  // hide popover for empty search field if it's still showing
  hideInputPopover();
  // get weather for the selected city
  await getWeather(event);
}

$("#search-input").on("focus", hideInputPopover);
$("#search-button").on("click", getWeather);
$("#history").on("click", ".city-btn", onCityBtnClick);

// get cities that are stored from local storage and show them to the DOM
function populateCityHistory() {
  const citysArr = getCitysFromLocalStorage();

  // clear previous citys in the DOM
  $("#history").empty();

  // build a list of citys and show to the DOM
  if (citysArr && citysArr.length > 0) {
    citysArr.forEach(function (city) {
      const cityTab = $('<button class="btn btn-secondary mb-2 city-btn">');
      cityTab.text(city);
      cityTab.attr("data-city", city);
      $("#history").append(cityTab);
    });
  }
}

// initialise popover
function initPopover() {
  $(function () {
    $('[data-toggle="popover"]').popover();
  });
}

// show input popover if search field is empty but search button is clicked
function showInputPopover() {
  $("#search-input").popover("enable");
  $("#search-input").popover("show");
}

// hide popover
function hideInputPopover() {
  $("#search-input").popover("disable");
  $("#search-input").popover("hide");
}

// function to run when app get started
function start() {
  initPopover();
  populateCityHistory();
}

start();
