const backgroundStyles = {
    'clear-day': 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
    'clear-night': 'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
    'partly-cloudy-day': 'linear-gradient(to top, #37ecba 0%, #72afd3 100%)',
    'partly-cloud-night': 'linear-gradient(to top, #5ee7df 0%, #b490ca 100%)',
    'cloudy': 'linear-gradient(60deg, #29323c 0%, #485563 100%)',
    'rain': 'linear-gradient(rgb(25, 27, 42), rgb(86, 93, 145))',
    'snow': 'linear-gradient(to right, #243949 0%, #517fa4 100%)',
    'sleet': 'linear-gradient(to right, #868f96 0%, #596164 100%)',
    'wind': 'linear-gradient(-20deg, #616161 0%, #9bc5c3 100%)',
    'fog': 'linear-gradient(180deg, rgba(18,21,23,1) 0%, rgba(94,95,98,1) 100%)'
}
const apiBase = 'api.openweathermap.org/data/2.5/'
const API_KEY = '9081c26a42e71c0b2ecd31972a2c36ba'
const proxy = 'https://cors-anywhere.herokuapp.com/' // for localhost use
const icon = new Skycons({'color': 'white'})
const body = document.body;
const temperatureDegrees = document.querySelector('.temperature-degrees')
const apparentTemperature = document.querySelector('.apparent-temperature')
const weatherDescription = document.querySelector('.weather-description')
const city = document.querySelector('.city')
const searchBox = document.querySelector('.data-location-search')
//const icon = document.querySelector('.icon') <- for scrapped images
//const searchBox = new google.maps.places.SearchBox(searchElement)

function manageResults(data) {
    const coords = {
        latitude: data.coord.lat,
        longitude: data.coord.lon
    }
    
    cityAndCountryString = `${data.name}, ${data.sys.country}`

    sendDataToServer(coords, cityAndCountryString)
}

function sendDataToServer(coords) {
    const latitude = coords.latitude
    const longitude = coords.longitude

    // post longitude and latitude to our server in server.js, get data back from server.js and .then set that data on website 
    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            latitude: latitude, 
            longitude: longitude
        })
        }).then(res => res.json()).then(data => {
            console.log(data)
            setWeatherData(data, cityAndCountryString)
    })
}

function setWeatherData(data) {
    city.textContent = cityAndCountryString
    temperatureDegrees.textContent = Math.round(data.temperature)
    apparentTemperature.textContent = `Feels like ${Math.round(data.apparentTemperature)}°C.`
    weatherDescription.textContent = `${data.summary}.`
    searchBox.value = ''

    icon.set('icon', data.icon)
    icon.play()

    body.style.background = backgroundStyles[data.icon]
    body.style.backgroundAttachment = 'fixed'

    // remove rain and snow effect by remove their classes
    if (body.classList.contains("weather")) {
        body.classList.remove("weather", "snow", "rain")
    } 
    // kinda performance intensive
    if (data.icon == 'rain') {
        body.classList.add('weather', 'rain')
    }
    if (data.icon == 'snow') {
        body.classList.add('weather', 'snow')
    }
}

icon.set('icon', 'CLEAR_DAY')
icon.play()

searchBox.addEventListener('keypress', (event) => {
    if (event.keyCode == 13) {
        searchedCity = searchBox.value
        fetch(`${proxy}${apiBase}weather?q=${searchedCity}&APPID=${API_KEY}`)
            .then(res => res.json()).then(data => {
                manageResults(data)
            })
    }
})

/* replacement code if google places api is being used (needs to be adjusted though)
searchBox.addListener('places_changed', () => {
    const place = searchBox.getPlaces()[0]
    if (place == null) return
    const latitude = place.geometry.location.lat()
    const longitude = place.geometry.location.lng()

    fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            latitude: latitude,
            longitude: longitude
        })
    }).then(res => res.json()).then(data => {
        setWeatherData(data, place.formatted_address)
    })
})
*/