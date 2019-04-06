const appId = '0ae6c1ab2f3771bcf82ab2f9738ba430';
let units = 'metric'; // jeśli chcemy wyświetlać tez w Fahrenheitach
let searchMethod = 'q'; // jeśli chcemy umozliwić wyszukiwanie po czymś innym niz nazwa miasta

// Geolocation
// Jak ktoś zaakceptuje
function geoSuccess(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    fetchByCoordinates(lat, lon);
}
// Jak ktoś odmówi - w takim przypadku chyba nic nie robimy i czekamy na input?
function geoDenied() {
    console.log('Geolocation denied');
}
navigator.geolocation.getCurrentPosition(geoSuccess, geoDenied);


const cityInput = document.getElementById('cityInput');
const suggestions = document.querySelector('.suggestions');

let city = '';

const data = './data/cities.json';
const cities = [];

//fetch file with names of cities for suggestions
fetch(data)
    .then(blob => blob.json())
    .then(data => cities.push(...data))

cityInput.addEventListener('submit', getCity);
cityInput.addEventListener('change', displayMatches);
cityInput.addEventListener('keyup', displayMatches);


// FINDING THE RIGHT DATA FOR THE FORECAST

function findDates(forecast) {
    // filtering out the wather for today
    // filteredForecast is a new array with weather for tomorrow and the next days
    let now = new Date();
    now = now.toDateString();
    let filteredForecast = forecast.list.filter(function (el) {
        return new Date(el.dt_txt).toDateString() !== now;
    })
    let day1 = filteredForecast.slice(0, 8);
    let day2 = filteredForecast.slice(8, 16);
    let day3 = filteredForecast.slice(16, 24);
    let day4 = filteredForecast.slice(24, 32);

    let days = [day1, day2, day3, day4];
    days = constructDays(days);
    updateForecast(days);
}

function constructDays(days) {
    minMax = minMaxTemp(days);
    maxTemps = minMax[0];
    minTemps = minMax[1];

    let day1 = new Day(days[0], maxTemps[0], minTemps[0]);
    let day2 = new Day(days[1], maxTemps[1], minTemps[1]);
    let day3 = new Day(days[2], maxTemps[2], minTemps[2]);
    let day4 = new Day(days[3], maxTemps[3], minTemps[3]);

    console.log(day1, day2, day3, day4)
    return [day1, day2, day3, day4];
}

// finding the min and max temperature for each day
function minMaxTemp(days) {
    let maxTemps = [];
    let minTemps = [];
    for (let i = 0; i < 4; i++) {
        let dailyMaxTemp = [];
        let dailyMinTemp = [];
        days[i].forEach(el => {
            dailyMaxTemp.push(el.main.temp_max);
            dailyMinTemp.push(el.main.temp_min);
        })
        maxTemps[i] = Math.max(...dailyMaxTemp);
        minTemps[i] = Math.min(...dailyMinTemp)
    }
    return [maxTemps, minTemps];
}


class Day {
    constructor(day, maxTemp, minTemp) {
        this.date = day[4].dt_txt;
        this.icon = day[4].weather[0].icon;
        this.id = day[4].weather[0].id,
            this.main = day[4].weather[0].main;
        this.description = day[4].weather[0].description;
        this.maxTemp = maxTemp;
        this.minTemp = minTemp;
    }
}

// FINDING THE RIGHT DATA FOR THE CURRENT WEATHER

class Today {
    constructor(currentWeather) {
        this.city = currentWeather.name,
            this.Clouds = currentWeather.clouds.all,
            this.Humidity = currentWeather.main.humidity,
            this.Pressure = currentWeather.main.pressure,
            this.Temp = currentWeather.main.temp,
            this.TempMax = currentWeather.main.temp_max,
            this.TempMin = currentWeather.main.temp_min,
            this.Sunrise = currentWeather.sys.sunrise,
            this.Sunset = currentWeather.sys.sunset,
            this.currDescription = currentWeather.weather[0].description,
            this.Id = currentWeather.weather[0].id,
            this.Main = currentWeather.weather[0].main,
            this.Wind = currentWeather.wind.speed,
            this.Icon = currentWeather.weather[0].icon
    }
}

// THE END OF FINDING DATA :)

// FETCHING
async function fetchByCity(query) {
    try {
        // read current weather
        let weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?${searchMethod}=${query}&units=${units}&APPID=${appId}`);
        if (!weatherResponse.ok) {
            throw new Error();
        }
        let currentWeather = await (weatherResponse.json());
        let today = new Today(currentWeather);
        console.log(today);
        updateDOM(currentWeather);

        // read forecast
        let forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${searchMethod}=${query}&units=${units}&APPID=${appId}`);
        if (!forecastResponse.ok) {
            throw new Error();
        }
        let forecast = await forecastResponse.json();
        findDates(forecast);

    } catch (err) {
        console.log(err.message);
    }

}

async function fetchByCoordinates(lat, lon) {
    try {
        // read current weather
        let weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&APPID=${appId}`)
        if (!weatherResponse.ok) {
            throw new Error();
        }
        let currentWeather = await (weatherResponse.json());
        let today = new Today(currentWeather);
        console.log(today);
        updateDOM(currentWeather);

        // read forecast
        let forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&APPID=${appId}`)
        if (!forecastResponse.ok) {
            throw new Error();
        }
        let forecast = await forecastResponse.json();
        findDates(forecast);

    } catch (err) {
        console.log(err.message);
    }
}

// THE END OF FETCHING

function getCity(e) {
    e.preventDefault();

    //list of special chars that we dont want in our string
    const regex = /(--)|[!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/;

    city = e.target[0].value.toLowerCase().trim();

    if (!city) {
        console.log('FormField is empty');
    } else if (city.match(regex) || city.match(/[0-9]/) && city.match(/[a-z]/)) {
        console.log('Input contains invalid characters')
        city = '';
    }

    if (city) {
        fetchByCity(city);
    }
}
//Wrzutka pogody do HTML
function updateDOM(currentWeather) {

    //<-----Weather Today Basic Info----->
    //OPIS
    let basic__description = document.getElementById("basic__description");
    let basicDescription = currentWeather.weather[0].description;
    basic__description.innerText = ' ' + basicDescription;

    //TEMPERATURA
    let basic__temperature = document.getElementById("basic__temperature");
    let basicTemperature = currentWeather.main.temp;
    basic__temperature.innerText = ' ' + basicTemperature;

    //IKONA
    let basic__icon = document.getElementById("basic__icon");
    if (currentWeather.weather[0].icon !== 0){
        basic__icon.src = 'icons/' + currentWeather.weather[0].icon + '.png';
    }   

    //<-----Weather Today Details----->
    //WIATR
    let wind__description = document.getElementById("wind__description");
    let windDescription = currentWeather.wind.speed;
    wind__description.innerText = ' ' + windDescription + ' m/s';

    //CIŚNIENIE
    let pressure__description = document.getElementById("pressure__description");
    let pressureDescription = currentWeather.main.pressure;
    pressure__description.innerText = ' ' + pressureDescription + ' hPa';

    //WILGOTNOŚĆ
    let humidity__description = document.getElementById("humidity__description");
    let humidityDescription = currentWeather.main.humidity;
    humidity__description.innerText = ' ' + humidityDescription + ' %';

}

// <----- Forecast----->
function updateForecast(days) {
    console.log(days);
    //DATA 1
    let first__data = document.getElementById("first__data");
    let firstData = days[0].date;
    first__data.innerText = ' ' + firstData;
    //TEMPERATURA 1
    let first__temperature = document.getElementById("first__temperature");
    let firstTemperature = days[0].maxTemp;
    first__temperature.innerText = ' ' + firstTemperature;
    //IKONA 1
    let first__icon = document.getElementById("first__icon");
    if (days[0].icon !== 0) {
        first__icon.src = 'icons/' + days[0].icon + '.png';
    }

    //DATA 2
    let second__data = document.getElementById("second__data");
    let secondData = days[1].date;
    second__data.innerText = ' ' + secondData;
    //TEMPERATURA 2
    let second__temperature = document.getElementById("second__temperature");
    let secondTemperature = days[1].maxTemp;
    second__temperature.innerText = ' ' + secondTemperature;
    //IKONA 2
    let second__icon = document.getElementById("second__icon");
    if (days[1].icon !== 0) {
        second__icon.src = 'icons/' + days[1].icon + '.png';
    }

    //DATA 3
    let third__data = document.getElementById("third__data");
    let thirdData = days[2].date;
    third__data.innerText = ' ' + thirdData;
    //TEMPERATURA 3
    let third__temperature = document.getElementById("third__temperature");
    let thirdTemperature = days[2].maxTemp;
    third__temperature.innerText = ' ' + thirdTemperature;
    //IKONA 3
    let third__icon = document.getElementById("third__icon");
    if (days[2].icon !== 0) {
        third__icon.src = 'icons/' + days[2].icon + '.png';
    }

    //DATA 4
    let fourth__data = document.getElementById("fourth__data");
    let fourthData = days[3].date;
    fourth__data.innerText = ' ' + fourthData;
    //TEMPERATURA 4
    let fourth__temperature = document.getElementById("fourth__temperature");
    let fourthTemperature = days[3].maxTemp;
    fourth__temperature.innerText = ' ' + fourthTemperature;
    //IKONA 4
    let fourth__icon = document.getElementById("fourth__icon");
    if (days[3].icon !== 0) {
        fourth__icon.src = 'icons/' + days[3].icon + '.png';
    }

}
//zrzynka z wes bosa
function findMatches(wordToMatch, cities) {
    const regexToMatch = new RegExp(wordToMatch, 'gi');
    return cities.filter(place => {
        return place.c.match(regexToMatch);
    })
}

function displayMatches() {
    const cityName = this[0].value;

    if (cityName.length >= 3) {
        const matchArray = findMatches(cityName, cities);
        const html = matchArray.map(place => {
            if (place.c.toLowerCase().search(cityName) === 0) {
                return `<li><span class="name">${place.c}</span></li>`;
            }
        }).filter(item => item).slice(0, 5).join('');

        suggestions.innerHTML = html;

    } else {
        suggestions.innerHTML = '';
    }
}