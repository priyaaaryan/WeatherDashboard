var userFormEl = document.querySelector("#city-form");
var cityInputEl = document.querySelector("#city");
var currentWeatherContainerEl = document.getElementById("current-weather");
var historyContainerEl = document.querySelector("#history-container");
var forecastEl = document.querySelector("#forecast");

var cities = [];

// Search Button Handler
var formSubmitHandler = function (event) {
  event.preventDefault();

  // Trim unecessary spaces
  var city = cityInputEl.value.trim();

  // If city is not found in array then get from Open Weather otherwise just get from array
  if (city) {
    cityFound = false;
    for (var i = 0; i < cities.length; i++) {
      if (city.toLowerCase() === cities[i].name.toLowerCase()) {
        displayWeatherData(city, cities[i].weatherData, false);
        cityFound = true;
        break;
      }
    }
    if (cityFound == false) {
      getWeather(city);
    }
    cityInputEl.value = "";
  } else {
    alert("Please enter a city");
  }
};
// Fetch weather from api
var getWeather = function (city) {
  // First fetch latitude and longitude of city from open weather then use it to fetch weather of the geolocation
  var coordinateApiURL =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    city +
    "&appid=61601e19c5fa6e594bfdc849af6afd53";
  fetch(coordinateApiURL).then(function (response1) {
    response1.json().then(function (locationData) {
      console.log(locationData);
      var lat = locationData[0].lat;
      var lon = locationData[0].lon;
      var weatherApiURL =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        lat +
        "&lon=" +
        lon +
        "&units=imperial&appid=61601e19c5fa6e594bfdc849af6afd53";
      fetch(weatherApiURL).then(function (response2) {
        response2.json().then(function (weatherData) {
          console.log(weatherData);
          displayWeatherData(locationData[0].name, weatherData, true);
        });
      });
    });
  });
};

var formatDate = function (date) {
  var dd = String(date.getDate()).padStart(2, "0");
  var mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = date.getFullYear();

  date = mm + "/" + dd + "/" + yyyy;
  return date;
};

// Display weather data for city
var displayWeatherData = function (city, weatherData, persist) {
  // Make the weather UI for the city visible
  currentWeatherContainerEl.style.display = "block";
  currentWeatherContainerEl.querySelector("#city").textContent = city;

  var today = new Date();
  currentWeatherContainerEl.querySelector("#date").textContent =
    formatDate(today);
  currentWeatherContainerEl.querySelector("#temperature").textContent =
    weatherData.current.temp;
  currentWeatherContainerEl.querySelector("#wind").textContent =
    weatherData.current.wind_speed;
  currentWeatherContainerEl.querySelector("#humidity").textContent =
    weatherData.current.humidity;
  currentWeatherContainerEl.querySelector("#icon").src =
    "https://openweathermap.org/img/w/" +
    weatherData.current.weather[0].icon +
    ".png";

  var uvIndex = weatherData.current.uvi;
  currentWeatherContainerEl.querySelector("#uv").textContent = uvIndex;

  // Color uvIndex label based on index
  if (uvIndex <= 2) {
    currentWeatherContainerEl.querySelector("#uv").style.background = "green";
  } else if (uvIndex <= 5) {
    currentWeatherContainerEl.querySelector("#uv").style.background = "yellow";
  } else if (uvIndex > 5) {
    currentWeatherContainerEl.querySelector("#uv").style.background = "red";
  }

  forecastEl.style.display = "block";
  var forecastContainerEl = forecastEl.querySelector("#forecast-container");
  forecastContainerEl.innerHTML = "";

  // Create forecast elements
  for (var i = 1; i <= 5; i++) {
    var dayEl = document.createElement("div");
    dayEl.classList = "card forecast-display";
    dayEl.style = "margin-top: 25px;";

    var dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + i);
    var date = formatDate(dateObj);

    var dateEl = document.createElement("h2");
    dateEl.textContent = date;
    dateEl.setAttribute("style", "color: white;");

    var iconEl = document.createElement("img");
    iconEl.setAttribute(
      "src",
      "https://openweathermap.org/img/w/" +
        weatherData.daily[i].weather[0].icon +
        ".png"
    );

    var tempEl = document.createElement("p");
    tempEl.textContent = "Temp: " + weatherData.daily[i].temp.day + "°F";

    var windEl = document.createElement("p");
    windEl.textContent = "Wind: " + weatherData.daily[i].wind_speed + " MPH";

    var humidityEl = document.createElement("p");
    humidityEl.textContent =
      "Humidity: " + weatherData.daily[i].humidity + " %";

    dayEl.append(dateEl);
    dayEl.append(iconEl);
    dayEl.append(tempEl);
    dayEl.append(windEl);
    dayEl.append(humidityEl);

    forecastContainerEl.append(dayEl);
  }

  if (persist) {
    persistWeatherData(city, weatherData);
  }
};

// Persist Weather Data by adding to array and adding to local storage
var persistWeatherData = function (city, weatherData) {
  updateHistoryUI(city, weatherData);

  var cityObj = {
    name: city,
    weatherData: weatherData,
  };

  cities.push(cityObj);
  localStorage.setItem("cities", JSON.stringify(cities));
  console.log(cities);
};

// Update the UI for the search history of cities
var updateHistoryUI = function (city, weatherData) {
  var historyEl = document.createElement("div");

  historyEl.classList = "list-item justify-space-between align-center";
  historyEl.onclick = function () {
    displayWeatherData(city, weatherData, false);
  };

  var titleEl = document.createElement("span");
  titleEl.textContent = city;

  historyEl.appendChild(titleEl);
  historyContainerEl.prepend(historyEl);
};

// Load history into UI
var loadHistory = function () {
  var searchHistory = localStorage.getItem("cities");
  if (!searchHistory) {
    return;
  }
  cities = JSON.parse(searchHistory);
  for (var i = 0; i < cities.length; i++) {
    updateHistoryUI(cities[i].name, cities[i].weatherData);
    if (i == cities.length - 1) {
      displayWeatherData(cities[i].name, cities[i].weatherData, false);
    }
  }
};

loadHistory();
userFormEl.addEventListener("submit", formSubmitHandler);
