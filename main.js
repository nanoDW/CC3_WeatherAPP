const appId = '0ae6c1ab2f3771bcf82ab2f9738ba430';
let units = 'metric'; // jeśli chcemy wyświetlać tez w Fahrenheitach
let searchMethod = 'q';    // jeśli chcemy umozliwić wyszukiwanie po czymś innym niz nazwa miasta

let cityInput = document.getElementById('cityInput');
let city = '';

cityInput.addEventListener('submit', getCity);

function fetchCurrent(query) {
    // current weather
    let currentWeather = fetch(`http://api.openweathermap.org/data/2.5/weather?${searchMethod}=${query}&units=${units}&APPID=${appId}`)
    .then(result => result.json())
    .then(result => console.log(result.weather[0].description));
    return currentWeather;
}

function fetchForecast(query) {
    // 5-day forecast
    let forecast = fetch(`http://api.openweathermap.org/data/2.5/forecast?${searchMethod}=${query}&units=${units}&APPID=${appId}`)
    .then(result => result.json())
    .then(result => console.log(result));
    return forecast;
}

fetchCurrent('Wrocław');
fetchForecast('Wrocław');

function getCity(e) {
    e.preventDefault();

    //list of special chars that we dont want in our string
    const regex = /[!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/;

    city = e.target[0].value.toLowerCase().trim();

    if (!city) {
        console.log('FormField is empty');
    } else if (city.match(regex) || city.match(/[0-9]/) && city.match(/[a-z]/)) {
        console.log('Invalid input')
        city = '';
    } else if (city[0].match(/[0-9]/)) {
        if (city.length === 5) {
            city = `Postal: ${city.slice(0, 2)}-${city.slice(2, 5)}`;
        } else if (city.length === 6 && city[2] === '-') {
            city = 'Postal: ' + city;
        } else {
            console.log('Invalid Postal code');
            city = '';
        }
        if (city) console.log(city);
    } else {
        console.log(city);
    }

    if(city){
        fetchCurrent(city);
        fetchForecast(city);
    }
}