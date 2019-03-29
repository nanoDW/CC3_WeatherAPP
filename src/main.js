const appId = '0ae6c1ab2f3771bcf82ab2f9738ba430';
let units = 'metric'; // jeśli chcemy wyświetlać tez w Fahrenheitach
let searchMethod = 'q';    // jeśli chcemy umozliwić wyszukiwanie po czymś innym niz nazwa miasta

let cityInput = document.getElementById('cityInput');
let city = '';

cityInput.addEventListener('submit', getCity);

function fetchCurrent(query) {
    // current weather
    let currentWeather = fetch(`http://api.openweathermap.org/data/2.5/weather?${searchMethod}=${query}&units=${units}&APPID=${appId}`)
    .then((response) => {
        if (!response.ok) {
           throw new Error();
        }
        return response.json();
    })
    .then(response => console.log(response.weather[0].description))
    .catch(error => console.log('Not found'))
}

function fetchForecast(query) {
    // 5-day forecast
    let forecast = fetch(`http://api.openweathermap.org/data/2.5/forecast?${searchMethod}=${query}&units=${units}&APPID=${appId}`)
    .then((response) => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(response => console.log(response))
    .catch(err => console.log('Not found'))
}

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
        fetchCurrent(city);
        fetchForecast(city);
    }
}