const backgroundStyles = {
    'clear-day': 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
    'clear-night': 'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
    'partly-cloudy-day': 'linear-gradient(to top, #37ecba 0%, #72afd3 100%)',
    'partly-cloudy-night': 'linear-gradient(to top, #5ee7df 0%, #b490ca 100%)',
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
const lowPerformanceToggle = document.getElementById('low-performance-mode-toggle')
const lowPerformanceText = document.getElementById('low-performance-mode-text')
const loading = document.querySelector('.loading')
const iconCanvas = document.getElementById('icon')
const icon = new Skycons({ 'color': 'white' })
const body = document.body
const temperatureDegrees = document.querySelector('.temperature-degrees')
const apparentTemperature = document.querySelector('.apparent-temperature')
const weatherDescription = document.querySelector('.weather-description')
const celsius = document.getElementById('celsius')
const fahrenheit = document.getElementById('fahrenheit')
const city = document.querySelector('.city')
const searchBox = document.querySelector('.data-location-search')
const humidity = document.querySelector('.humidity')
const windSpeed = document.querySelector('.wind-speed')
const precipProb = document.querySelector('.precip-probability')
const detailedWeatherPageContainer = document.querySelector('.detailed-page-container')
const dataMemory = []
let celsiusActivated = true
let currentTemp
let currentApparentTemp
let currentWindSpeed
//const icon = document.querySelector('.icon') <- for scrapped images
//const searchBox = new google.maps.places.SearchBox(searchElement)

icon.set('icon', 'clear-day')
icon.play()

searchBox.addEventListener('keypress', async event => {
    if (event.keyCode == 13) {
        dataMemory.length = 0
        currentTemp = undefined
        currentApparentTemp = undefined
        currentWindSpeed = undefined
        searchedCity = searchBox.value

        iconCanvas.style.display = 'none'
        loading.style.display = 'inline'
        city.textContent = 'LOADING...'

        const response = await fetch(
            `${proxy}${apiBase}weather?q=${searchedCity}&APPID=${API_KEY}`
        )

        if (response.status != 200) {
            loading.style.display = 'none'
            iconCanvas.style.display = 'inline'
            city.textContent = 'LOCATION NOT FOUND'
        }

        const openWeatherData = await response.json()
        manageResults(openWeatherData)
    }
})

async function manageResults(openWeatherData) {
    const coords = {
        latitude: openWeatherData.coord.lat,
        longitude: openWeatherData.coord.lon
    }

    cityAndCountryString = `${openWeatherData.name}, ${openWeatherData.sys.country}`

    const data = await getWeatherData(coords)
    setWeatherData(data)
}

async function getWeatherData(coords) {
    const latitude = coords.latitude
    const longitude = coords.longitude

    // post longitude and latitude to our server in server.js, get data back from server.js and then set that data on website
    // Async await Promises syntax
    const response = await fetch('/weather', {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            latitude: latitude,
            longitude: longitude
        })
    })

    const data = await response.json()
    return data
}

function setWeatherData(data) {
    dataMemory.push(data) // add data to global scope
    city.textContent = cityAndCountryString
    weatherDescription.textContent = `${data.summary}.`
    searchBox.value = ''
    humidity.textContent = `${(data.humidity * 100).toFixed(0)}%`
    precipProb.textContent = `${Math.round(data.precipProbability * 100)}%`

    if (!celsiusActivated) {
        let temperatureDegreesInt = Math.round(convertToFahrenheit(data.temperature))
        let apparentTemperatureInt = Math.round(convertToFahrenheit(data.apparentTemperature))
        let windSpeedInt = Math.round(data.windSpeed / 1.609)

        temperatureDegrees.textContent = Math.round(temperatureDegreesInt)
        apparentTemperature.textContent = `Feels like ${Math.round(apparentTemperatureInt)}°F.`
        windSpeed.innerText = `${windSpeedInt} mph`

        currentTemp = temperatureDegreesInt
        currentApparentTemp = apparentTemperatureInt
        currentWindSpeed = windSpeedInt
    } else {
        temperatureDegrees.textContent = Math.round(data.temperature)
        apparentTemperature.textContent = `Feels like ${Math.round(data.apparentTemperature)}°C.`
        windSpeed.innerText = `${Math.round(data.windSpeed)} km/h`
    }

    loading.style.display = 'none'
    iconCanvas.style.display = 'inline'
    icon.set('icon', data.icon)
    icon.play()

    body.style.background = backgroundStyles[data.icon]
    body.style.backgroundAttachment = 'fixed'
    lowPerformanceText.style.textShadow = ''

    if (data.icon == 'clear-day') {
        lowPerformanceText.style.textShadow = '-1px 0px 12px black'
    }

    body.classList.remove('weather', 'snow', 'rain')

    if (!lowPerformanceToggle.checked) {
        // kinda performance intensive
        if (data.icon == 'rain' || data.icon == 'snow') {
            body.classList.add('weather', data.icon)
        }
    }
}

function convertToFahrenheit(temperature) {
    return (temperature * 9) / 5 + 32
}

function convertToCelsius(temperature) {
    return ((temperature - 32) * 5) / 9
}

function showDetailedWeatherPage() {
    detailedWeatherPageContainer.style.display = 'block'
    detailedWeatherPageContainer.scrollIntoView({
        behavior: 'smooth'
    })
}

function showMainWeatherPage() {
    body.scrollIntoView({
        behavior: 'smooth',
        alignToTop: true
    })
}

celsius.addEventListener('click', () => {
    if (!celsiusActivated) {
        convertedCelsius = convertToCelsius(currentTemp)
        convertedApparentCelsius = convertToCelsius(currentApparentTemp)

        temperatureDegrees.innerText = Math.round(convertedCelsius)
        apparentTemperature.innerText = `Feels like ${Math.round(convertedApparentCelsius)}°C.`

        celsius.style.color = 'white'
        celsius.style.fontWeight = 'bold'
        fahrenheit.style.color = 'grey'
        fahrenheit.style.fontWeight = 'normal'

        celsius.classList.remove('hover-class')
        fahrenheit.classList.add('hover-class')

        convertedWindSpeed = currentWindSpeed * 1.609
        windSpeed.innerText = `${Math.round(convertedWindSpeed)} km/h`

        currentWindSpeed = convertedWindSpeed
        currentTemp = convertedCelsius
        currentApparentTemp = convertedApparentCelsius
        celsiusActivated = true
    }
})

fahrenheit.addEventListener('click', () => {
    if (celsiusActivated) {
        if (typeof (currentTemp && currentApparentTemp) == 'number') {
            convertedFahrenheit = convertToFahrenheit(currentTemp)
            convertedApparentFahrenheit = convertToFahrenheit(currentApparentTemp)
        } else {
            convertedFahrenheit = convertToFahrenheit(dataMemory[0].temperature)
            convertedApparentFahrenheit = convertToFahrenheit(dataMemory[0].apparentTemperature)
        }

        temperatureDegrees.innerText = Math.round(convertedFahrenheit)
        apparentTemperature.innerText = `Feels like ${Math.round(convertedApparentFahrenheit)}°F.`

        fahrenheit.style.color = 'white'
        fahrenheit.style.fontWeight = 'bold'
        celsius.style.color = 'grey'
        celsius.style.fontWeight = 'normal'

        fahrenheit.classList.remove('hover-class')
        celsius.classList.add('hover-class')

        if (typeof (currentWindSpeed) == 'number') {
            convertedWindSpeed = Math.round(currentWindSpeed / 1.69)
        } else {
            convertedWindSpeed = Math.round(dataMemory[0].windSpeed / 1.609)
        }

        windSpeed.innerText = `${convertedWindSpeed} mph`

        currentWindSpeed = convertedWindSpeed
        currentTemp = convertedFahrenheit
        currentApparentTemp = convertedApparentFahrenheit
        celsiusActivated = false
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
