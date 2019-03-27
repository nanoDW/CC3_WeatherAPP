const appId = '0ae6c1ab2f3771bcf82ab2f9738ba430';
let units = 'metric'; // jeśli chcemy wyświetlać tez w Fahrenheitach
let searchMethod = 'q';    // jeśli chcemy umozliwić wyszukiwanie po czymś innym niz nazwa miasta


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