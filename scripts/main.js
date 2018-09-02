// Configuração de rede
var baseUrl = "http://192.168.0.110:3000/api/";
var myHeaders = new Headers();
var myGet = { method: 'GET',
               headers: myHeaders,
               mode: 'cors', 
               cache: 'default' };

// labuta do mapa
var map, mcg, markers = [];
var ufersaLatLng = [-5.2015139, -37.3254804];

function initMap() {
    map = L.map('mapid').setView(ufersaLatLng, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mcg = L.markerClusterGroup().addTo(map);

    markers.push({
        inst: L.marker(ufersaLatLng).addTo(mcg)
        .bindPopup('Olá Fernanda!')
    });
}

// WINDOW LOAD

/* window.addEventListener("load", function() {
    console.log( 'window is loaded!' );
}) */

window.onload = function() {
    console.log('Window is loaded!' );
    initMap();

    fetch(baseUrl,myGet).then(function (response) {
        return response.text();
    }).then(function (jsonResponse) {
        console.log(jsonResponse);
        markers[0].inst.setPopupContent(jsonResponse).openPopup();
    });
}