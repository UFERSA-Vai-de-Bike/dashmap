// Inicialização
window.onload = function() {
    console.log('Window is loaded!' );
    initMap();
    checkGeoLocation();
    checkAPI();
}

// Configuração de rede
var baseUrl = "http://192.168.0.110:3000/api/";
var myHeaders = new Headers();
var myGet = { method: 'GET',
               headers: myHeaders,
               mode: 'cors', 
               cache: 'default' };

// configuração de tipo
var typeElem = {
    BIKE: 1,
    STATION: 2 
}

// labuta do mapa
var ufersaLatLng = [-5.2015139, -37.3254804];
var hasGeoLoc = false;

var map, mcg, meMarker, markers = [];
//  map.removeLayer(marker)
var mPerOptions = {
    title: "Esse é você!",
    riseOnHover: true,
    icon:  L.icon({
        iconUrl: 'assets/marker-person.png',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [1, -38],
        shadowUrl: 'assets/marker-shadow.png',
        shadowSize: [64, 50],
        shadowAnchor: [23, 50]
    })
}

function setStMarker(station) {
    markers.push(
        {
            id: station.idstation,
            typeElem: typeElem.STATION,
            inst: L.marker([station.lat,station.lon],
                {
                    title: "Estação " + station.name,
                    riseOnHover: true,
                    icon: L.icon({
                        iconUrl: 'assets/marker-station.png',
                        iconSize: [30, 40],
                        iconAnchor: [15, 40],
                        popupAnchor: [1, -38],
                        shadowUrl: 'assets/marker-shadow.png',
                        shadowSize: [64, 50],
                        shadowAnchor: [23, 50]
                    })
                }).addTo(mcg)
        }
    )
}

function setBkMarker(bike) {
    markers.push(
        {
            id: bike.idbike,
            typeElem: typeElem.BIKE,
            inst: L.marker([bike.lat,bike.lon],
                {
                    title: "Bike " + bike.name,
                    riseOnHover: true,
                    icon: L.icon({
                        iconUrl: 'assets/marker-bike.png',
                        iconSize: [30, 40],
                        iconAnchor: [15, 40],
                        popupAnchor: [1, -38],
                        shadowUrl: 'assets/marker-shadow.png',
                        shadowSize: [64, 50],
                        shadowAnchor: [23, 50]
                    })
                }).addTo(mcg1)
        }
    )
}

function initMap() {
    map = L.map('mapid').setView(ufersaLatLng, 17); // zoom max 18
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mcg = L.markerClusterGroup().addTo(map);
    mcg1 = L.markerClusterGroup().addTo(map);

    // TESTE AQUI ALLEF 

    // Configurei uns icons que achei ai, peguei uns do edubi mesmo (veja a pasta assets)
    // só teste a de cima, não tentei fazendo uma classe

    // descomente esse aqui pra ver como é o default do leaflet
    // L.marker(ufersaLatLng,{title: "Olá!",riseOnHover: true}).addTo(map).bindPopup("Olá Allef!");


    // JEITO COM ICON PNG
    /* L.marker(ufersaLatLng,
    {
        title: "Olá!",
        riseOnHover: true,
        icon: L.icon({
            iconUrl: 'assets/marker-statin.png',
            iconSize: [30, 40],
            iconAnchor: [15, 40],
            popupAnchor: [1, -38],
            shadowUrl: 'assets/marker-shadow.png',
            shadowSize: [64, 50],
            shadowAnchor: [23, 50]
        })
    }).addTo(map)
    .bindPopup('Olá Allef!'); */

    // JEITO COM CLASSE CSS
    // you can set .my-div-icon styles in CSS
    // L.marker(ufersaLatLng,
    //     {
    //         title: "Olá!",
    //         riseOnHover: true,
    //         icon: L.divIcon(/* {className: 'my-div-icon'} */)
    //     }).addTo(map).bindPopup('Olá Allef!');
}

function checkAPI() {
    fetch(baseUrl,myGet).then(function (response) {
        return response;
    }).then(function (res) {
        if (res.status === 200) {
            res.text().then(function(data) {
                console.log(data);
            });
            // mete brasa
            loadStations();
            loadBikesOnRide();
        }
    });
}

function loadStations() {
    fetch(baseUrl + "stations/val",myGet).then(function (response) {
        return response;
    }).then(function (res) {
        console.log(res);
        if (res.status === 200) {
            res.json().then(function(res) {
                // console.log(res);
                res.data.forEach(setStMarker);
            });
        }
    });
}
function loadBikesOnRide() {
    fetch(baseUrl + "bikes/onride",myGet).then(function (response) {
        return response;
    }).then(function (res) {
        console.log(res);
        if (res.status === 200) {
            res.json().then(function(res) {
                console.log(res);
                res.data.forEach(setBkMarker);
            });
        }
    });
}

function checkGeoLocation() {
    if ("geolocation" in navigator) {
        /* geolocation is available */
        navigator.geolocation.watchPosition(geo_success, geo_error, {enableHighAccuracy:true, maximumAge:30000, timeout:27000});
    } else {
        alert("Desculpe, mas o serviço de geolocalização não é suportado pelo seu navegador.");
    }
}

function geo_success(position) {
    // console.log("Nova posição");
    // console.log(position);
    if (meMarker) {
        meMarker.setLatLng([position.coords.latitude,position.coords.longitude]);
    } else {
        meMarker = L.marker([position.coords.latitude,position.coords.longitude],mPerOptions).addTo(map);
        // map.flyTo(meMarker.getLatLng());
    }
}
function geo_error(positionError) {
    console.log(positionError);

}