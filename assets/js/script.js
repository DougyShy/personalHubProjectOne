

var dateEl = document.querySelector('.date');
var sportsEl = document.querySelector('.sports');
var stocksEl = document.querySelector('.stocks');
var weatherEl = document.querySelector('.weather');
var greetingEl = document.querySelector('.greeting');
var eventEl = document.querySelector('.event');

var dateFormats = ["dddd, MMM D, YYYY", "MMM D, YYYY", "MMMM D, YYYY h:mm A", "ddd, MMM D, YYYY h:mm A" ];
var sportsTeams = ["Spurs", "Mavericks"];
var longitude = 0;
var latitude = 0;

username = "Doug";

var city = "San Antonio";

localStorage.setItem("teams", JSON.stringify(sportsTeams));
let newArray = JSON.parse(localStorage.getItem("teams"));

var currentDateFormatIndex = 0;

sportsAPI_key = "b5074573df57c56932b0b3096843718d";
stocksAPI_key_yahoo = "MV2TQN7ZHOAGXTXR#1";
stocksAPI_key_gmail = "BVLYMCBPVRQQMVOOd";
weatherAPI_key = '260e9b6795e2166dad8db2bb1059d931';
stocksAPI_key = 'Cb1Bt2MwPUuxnlx0AWZwo0gpHjUfTijQ';

const nextDateFormat = function() {
    currentDateFormatIndex++;
    if (currentDateFormatIndex < dateFormats.length) {
        dateEl.innerHTML = dayjs().format(dateFormats[currentDateFormatIndex]);
    } else {
        currentDateFormatIndex = 0;
        dateEl.innerHTML = dayjs().format(dateFormats[currentDateFormatIndex]);
    }
}

// Set city location longitude and latitude using additional api - works for major cities but gets weird for smaller or lesser known locals - but.... it's free
// made async because I was running into coding issues with respect to code being implemented before the fetch finished. This seemed to fix the problem and I learned a little
async function setCityLonLat(city) {
    var geoApiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=3&appid=' + weatherAPI_key;
  
    response = await fetch(geoApiUrl);
    if (response.ok) {
      data = await response.json();
      if(data.length > 0) {
        
        longitude = data[0].lon;
        latitude = data[0].lat;
  
      } else {
        cityInputEl.value = "";
        // need to turn this into a modal(?)
        alert('Invalid or unavailable city name request. Please try again.');
      } 
    }               
  };

const buildStocks = async function (symbols) {
    let stocks = symbols;

    myArray = [];
    
    for (i = 0; i < symbols.length; i++) {
        let stocksAPI_URL = "https://financialmodelingprep.com/api/v3/quote-order/" + symbols[i] + "?apikey=" + stocksAPI_key;
        response = await fetch(stocksAPI_URL);
        if (response.ok) {
            data = await response.json();
            console.log("STOCK DATA HERE:");
            console.log(data);
            console.log(data[0]['symbol']);
            myArray.push([data[0]['symbol'], data[0]['price']])
        }
    }
    
    

    let stocksContainer = document.createElement("div");
    stocksContainer.setAttribute("class", "flex flex-wrap");

    for (i = 0; i < myArray.length; i++) {
        let singleStockEl = document.createElement("div");
        singleStockEl.setAttribute("class", "p-2 text-white");
        singleStockEl.innerHTML = myArray[i][0] + " : $" + myArray[i][1];   
        stocksContainer.appendChild(singleStockEl);
    }

    stocksEl.append(stocksContainer);
}


const buildWeather = async function () {
    await setCityLonLat(city);

    let currentDayApiUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=' + weatherAPI_key;
    // can use this for forecast in future if element added
    //let forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=' + app_id;

    fetch(currentDayApiUrl)
        .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
            displayCurrentWeather(data);
            });
        } else {
            alert('Error: ' + response.statusText);
        }
        })
        .catch(function (error) {
        alert('Unable to connect to OpenWeather API');
        });
}

var displayCurrentWeather = function (data) {

    const weatherIconURL = 'https://openweathermap.org/img/wn/' + data['weather'][0]['icon'] + '@2x.png'  
  
    weatherEl.innerHTML = "<h1>" + data['name'] + " (" + dayjs().format("M/D/YYYY") + ")" + "<img class='weatherIcon' src='" + weatherIconURL + "'/></h1>" +
                                   "<h2>- Temp: " + data['main']['temp'] + "°&nbspF</h2><h2>- Wind: &nbsp" + data['wind'].speed + "&nbsp MPH</h2><h2>- Humidity: &nbsp" + data['main']['humidity'] + "&nbsp%</h2>";
    
  };

const buildEvent = async function () {
    let quoteAPI_URL = "https://byabbe.se/on-this-day/" + ((dayjs().month())+1) + "/" + dayjs().date() + "/events.json";
    
    let event = "";
    let year = "";

    response = await fetch(quoteAPI_URL, { mode: 'cors'});
    if (response.ok) {
        data = await response.json();
            randQuoteIndex = [Math.floor(Math.random() * data['events'].length)];
            year =  data['events'][randQuoteIndex]['year'];
            event = data['events'][randQuoteIndex]['description'];
            eventEl.innerHTML = "<h1><b>On today's date in " + year + ", " + (dayjs().year() - year) + " years ago:</b></h1><br><h2>" + " - " + event;             
    } else
    alert('Error: ' + response.status);
    
}

const buildSports = async function (teams) {

    let sportsAPI_URL = "https://v2.nba.api-sports.io/standings?league=standard&season=2023&team=31";
    let teamLogoURL = "";
    let winTotal = 0;
    let lossTotal = 0;

    var myHeaders = new Headers();
    myHeaders.append("x-rapidapi-key", sportsAPI_key);
    myHeaders.append("x-rapidapi-host", "v2.nba.api-sports.io");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    response = await fetch(sportsAPI_URL, requestOptions)
 
    if (response.ok) {
        data = await response.json()

            winTotal = data['response'][0]['win']['total'];
            lossTotal = data['response'][0]['loss']['total'];
            teamLogoURL = data['response'][0]['team']['logo'];

        } else {
        alert('Error: ' + response.statusText);
    }

    let sportsContainerEl = document.createElement("div");
    sportsContainerEl.setAttribute("class", "flex");

    let teamIconEl = document.createElement("img");
    
    teamIconEl.setAttribute("src", teamLogoURL);
    teamIconEl.setAttribute("class", "teamIcon flex-row w-1/5 p-3" );
    
    let winsLossesEl = document.createElement("div");
    winsLossesEl.setAttribute("class", "flex items-center");
    winsLossesEl.innerHTML = "WINS: " + winTotal + "  / LOSSES: " + lossTotal;

    sportsContainerEl.appendChild(teamIconEl);
    sportsContainerEl.appendChild(winsLossesEl);

    sportsEl.appendChild(sportsContainerEl);

}

const generateGreeting = function(hour) {
    let greeting = "";
    if (hour > 15) {
        greeting += "Good Evening, ";
    } else if ( hour > 12) {
        greeting += "Good Afternoon, ";
    } else {
        greeting += "Good Morning, ";
    }
    greeting += username;
    greetingEl.innerHTML = greeting;
}

currentDate = dayjs().format(dateFormats[currentDateFormatIndex]);
dateEl.innerHTML = dayjs().format(dateFormats[currentDateFormatIndex]);

buildSports(sportsTeams);

buildWeather();
buildStocks(["IBM", "AAPL"]);

buildEvent();

generateGreeting(dayjs().hour());

dateEl.addEventListener('click', nextDateFormat);
eventEl.addEventListener('click', buildEvent);