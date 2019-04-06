const moment = require('moment-timezone')
const appId = '0ae6c1ab2f3771bcf82ab2f9738ba430';
const apiKey = 'ZA9KO8TP5SVD';
let units = 'metric'; // jeśli chcemy wyświetlać tez w Fahrenheitach
let searchMethod = 'q';    // jeśli chcemy umozliwić wyszukiwanie po czymś innym niz nazwa miasta

// Geolocation
navigator.geolocation.getCurrentPosition(geoSuccess, geoDenied);

// Jak ktoś zaakceptuje
function geoSuccess(position) {
   lat = position.coords.latitude;
   lon = position.coords.longitude;
   fetchByCoordinates(lat,lon);
}
// Jak ktoś odmówi - w takim przypadku chyba nic nie robimy i czekamy na input?
function geoDenied() {
    console.log('Geolocation denied');
    // local storage
    if (localStorage.city) {
        fetchByCity(localStorage.city);
    }
}

const cityInput = document.getElementById('cityInput');
const suggestions = document.querySelector('.suggestions');

let city = '';

const data = './data/cities.json';
const cities = [];

// fetch file with names of cities for suggestions
// fetch(data)
//     .then(blob => blob.json())
//     .then(data => cities.push(...data))

cityInput.addEventListener('submit', getCity);
cityInput.addEventListener('change', displayMatches);
cityInput.addEventListener('keyup', displayMatches);


// FINDING THE RIGHT DATA FOR THE FORECAST

async function findTimeZone(lng, lat) {
    try {
        let timeZoneResponse = await fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=${apiKey}&format=json&by=position&lng=${lng}&lat=${lat}`);
        if (!timeZoneResponse.ok) {
            throw new Error();
        }
        let timeZone = await (timeZoneResponse.json());
        zoneName = timeZone.zoneName;
        console.log(zoneName)
        return zoneName;
    } catch (err) {
        console.log(err.message);
    }
}

function convertTimeZone(forecast, zoneName) {
    forecast.list.map(el => {
        let dateUtc = el.dt * 1000;
        let dateUtcFormatted = moment.utc(dateUtc).format()
        el.dt_txt_adjusted = moment.tz(dateUtcFormatted, zoneName).format()

    })
    findDates(forecast, zoneName);
}


function findDates(forecast, zoneName) {
    // filtering out the wather for today
    // filteredForecast is a new array with weather for tomorrow and the next days
    let now = moment.utc(new Date())
    now = now.format();
    now = moment(now).tz(zoneName).format('ll');
    let filteredForecast = forecast.list.filter(function (el) {
        return moment(el.dt_txt_adjusted).tz(zoneName).format('ll') !== now;
    })
    let day1 = filteredForecast.slice(0, 8);
    let day2 = filteredForecast.slice(8, 16);
    let day3 = filteredForecast.slice(16, 24);
    let day4 = filteredForecast.slice(24, 32);

    days = [day1, day2, day3, day4];
    constructDays(days);
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
        this.date = day[4].dt_txt_adjusted;
        this.id = day[4].weather[0].id,
            this.main = day[4].weather[0].main;
        this.description = day[4].weather[0].description;
        this.maxTemp = maxTemp;
        this.minTemp = minTemp;
    }
}

// FINDING THE RIGHT DATA FOR THE CURRENT WEATHER

class Today {
    constructor(currentWeather, timeZone) {
        this.city = currentWeather.name,
            this.Clouds = currentWeather.clouds.all,
            this.Humidity = currentWeather.main.humidity,
            this.Pressure = currentWeather.main.pressure,
            this.Temp = currentWeather.main.temp,
            this.TempMax = currentWeather.main.temp_max,
            this.TempMin = currentWeather.main.temp_min,
            this.Sunrise = moment(currentWeather.sys.sunrise * 1000).tz(timeZone).format(),
            this.Sunset = moment(currentWeather.sys.sunset * 1000).tz(timeZone).format(),
            this.currDescription = currentWeather.weather[0].description,
            this.Id = currentWeather.weather[0].id,
            this.Main = currentWeather.weather[0].main,
            this.Wind = currentWeather.wind.speed
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
        let timeZone = await findTimeZone(currentWeather.coord.lon, currentWeather.coord.lat);
        let today = new Today(currentWeather, timeZone);
        console.log(today);

        // read forecast
        let forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${searchMethod}=${query}&units=${units}&APPID=${appId}`);
        if (!forecastResponse.ok) {
            throw new Error();
        }
        let forecast = await forecastResponse.json();
        convertTimeZone(forecast, zoneName);
        
    }
    catch(err) {
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
         let timeZone = await findTimeZone(currentWeather.coord.lon, currentWeather.coord.lat);
         let today = new Today(currentWeather, timeZone);
         console.log(today);

        // read forecast
        let forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&APPID=${appId}`)
        if (!forecastResponse.ok) {
            throw new Error();
        }
        let forecast = await forecastResponse.json();
        convertTimeZone(forecast, zoneName);

        }
        catch (err) {
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

    if(city){
        localStorage.setItem('city', city);
        fetchByCity(city);
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