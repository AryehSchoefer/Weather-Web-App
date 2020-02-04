const apiBase = 'api.openweathermap.org/data/2.5/'
const API_KEY = '9081c26a42e71c0b2ecd31972a2c36ba'
const proxy = 'https://cors-anywhere.herokuapp.com/' // for localhost use
//const icon = document.querySelector('.icon')
const icon = new Skycons({'color': 'white'})
const temperatureDegrees = document.querySelector('.temperature-degrees')
const apparentTemperature = document.querySelector('.apparent-temperature')
const weatherDescription = document.querySelector('.weather-description')
const city = document.querySelector('.city')
const searchBox = document.querySelector('.data-location-search')
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
}

icon.set('icon', 'clear-day')
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

/*
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

/*
{"coord":{"lon":-0.13,"lat":51.51},
"weather":[{"id":300,"main":"Drizzle","description":"light intensity drizzle","icon":"09d"}],
"base":"stations",
"main":{"temp":280.32,"pressure":1012,"humidity":81,"temp_min":279.15,"temp_max":281.15},
"visibility":10000,
"wind":{"speed":4.1,"deg":80},
"clouds":{"all":90},
"dt":1485789600,
"sys":{"type":1,"id":5091,"message":0.0103,"country":"GB","sunrise":1485762037,"sunset":1485794875},
"id":2643743,
"name":"London",
"cod":200}
*/