const appId = '0ae6c1ab2f3771bcf82ab2f9738ba430';
let units = 'metric'; // jeśli chcemy wyświetlać tez w Fahrenheitach
let searchMethod = 'q';    // jeśli chcemy umozliwić wyszukiwanie po czymś innym niz nazwa miasta

// Geolocation
// Jak ktoś zaakceptuje
function geoSuccess(position) {
   lat = position.coords.latitude;
   lon = position.coords.longitude;
   fetchByCoordinates(lat,lon);
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

    days = [day1, day2, day3, day4]
    minMaxTemp(days);
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
    console.log(maxTemps);
    console.log(minTemps);
}

// FINDING THE RIGHT DATA FOR THE CURRENT WEATHER

class Today {
    constructor(currentWeather) {
        this.currClouds = currentWeather.clouds.all,
        this.currHumidity = currentWeather.main.humidity,
        this.currPressure = currentWeather.main.pressure,
        this.currTemp = currentWeather.main.temp,
        this.currTempMax = currentWeather.main.temp_max,
        this.currTempMin = currentWeather.main.temp_min,
        this.currSunrise = currentWeather.sys.sunrise,
        this.currSunset = currentWeather.sys.sunset,
        this.currDescription = currentWeather.weather[0].description,
        this.currId = currentWeather.weather[0].id,
        this.currMain = currentWeather.weather[0].main,
        this.currWind = currentWeather.wind.speed
    }
}

// THE END OF FINDING DATA :)

// FETCHING
async function fetchByCity(query) {
    try {
        // read current weather
        let weatherResponse = await fetch(`http://api.openweathermap.org/data/2.5/weather?${searchMethod}=${query}&units=${units}&APPID=${appId}`);
        if (!weatherResponse.ok) {
            throw new Error();
        }
        let currentWeather = await (weatherResponse.json());
        let today = new Today(currentWeather);
        console.log(today);

        // read forecast
        let forecastResponse = await fetch(`http://api.openweathermap.org/data/2.5/forecast?${searchMethod}=${query}&units=${units}&APPID=${appId}`);
        if (!forecastResponse.ok) {
            throw new Error();
        }
        let forecast = await forecastResponse.json();
        findDates(forecast);
        
    }
    catch(err) {
        console.log(err.message);
    }
    
}

async function fetchByCoordinates(lat, lon) {
    try {
        // read current weather
        let weatherResponse = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&APPID=${appId}`)
        if (!weatherResponse.ok) {
            throw new Error();
        }
        let currentWeather = await (weatherResponse.json());
        let today = new Today(currentWeather);
        console.log(today);

        // read forecast
        let forecastResponse = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&APPID=${appId}`)
        if (!forecastResponse.ok) {
            throw new Error();
        }
        let forecast = await forecastResponse.json();
        findDates(forecast);

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
        fetchByCity(city);
    }
}

//zrzynka z wes bosa
function findMatches(wordToMatch, cities) {
    return cities.filter(place => {
        const regexToMatch = new RegExp(wordToMatch, 'gi');
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
        }).join('');

        suggestions.innerHTML = html;
        
    } else {
        suggestions.innerHTML = '';
    }
}