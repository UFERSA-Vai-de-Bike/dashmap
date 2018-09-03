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

var map, mcg, meMarker, markers = [], welcomeDialog, welcomeBtn, stNearBtn;
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
            dialog: L.control.dialog({initOpen: false}).setContent(setStContent(station)).addTo(map),
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
                }).addTo(mcg).on('click', function(ev) {
                    for (var i in markers) {
                        if ((markers[i].id === station.idstation) && (markers[i].typeElem === typeElem.STATION)) {
                            markers[i].dialog.open();
                        }
                    }
                })
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

    welcomeBtn = L.easyButton( '<span class="quest">&quest;</span>', function(){
        this.disable();
        welcomeDialog.open();
      }).addTo(map);
    welcomeBtn.disable();

    welcomeDialog = L.control.dialog()
          .setContent(welcontent)
          .addTo(map);

    
    map.on('dialog:closed', function(e){welcomeBtn.enable()});

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
                console.log(res.data);
                if (res.data.length) {
                    if (stNearBtn) {
                        stNearBtn.enable();
                    } else {
                        stNearBtn =  L.easyButton( '<img class="img-btn" src="/assets/get-bike.png">', function(){
                            this.disable();
                            if(meMarker) {
                                toNeareSt(meMarker.getLatLng());
                            }
                          }).addTo(map);
                    }
                } else {
                    if (stNearBtn) {
                        stNearBtn.disable();
                    }
                }
                res.data.forEach(function(station){
                    updMarkers(station,typeElem.STATION);
                });
                // todo start thread
            });
        }
    });
}
function loadBikesOnRide() {
    fetch(baseUrl + "bikes/onride",myGet).then(function (response) {
        return response;
    }).then(function (res) {
        if (res.status === 200) {
            res.json().then(function(res) {
                // console.log(res.data);
                res.data.forEach(function (bike) {
                    updMarkers(bike,typeElem.BIKE);
                });
                // todo start thread
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
    if (meMarker) {
        meMarker.setLatLng([position.coords.latitude,position.coords.longitude]);
    } else {
        console.log(position.coords);
        meMarker = L.marker([position.coords.latitude,position.coords.longitude],mPerOptions).addTo(map);
        map.flyTo(meMarker.getLatLng());
        // todo load easy button
        loadEasybtnPerson();
    }
}
function geo_error(positionError) {
    console.log(positionError);
}

function loadEasybtnPerson() {
    L.easyButton( '<span class="target">&target;</span>', function(){
        map.flyTo(meMarker.getLatLng());
      }).addTo(map);
}


var welcontent = ['<h2>UFERSA Vai de Bike</h2><p>Bem vindo ao mapa do sistema UFERSA Vai de bike.',
                '</p><p>Abaixo segue uma breve legenda.</p>',
                '<table><tr><th>Ícone</th><th>Significado</th></tr>',
                '<tr><td><img class="leg" src="/assets/marker-person.png"></td>',
                '<td>Sua localização se disponível.</td></tr>',
                '<tr><td><img class="leg" src="/assets/marker-station.png"></td>',
                '<td>Estação de bicicletas, clique em alguma para obter informações.</td></tr>',
                '<tr><td><img class="leg" src="/assets/marker-bike.png"></td>',
                '<td>Bicicletas em uso no momento.</td></tr>',
                '<tr><td><span class="target-leg">&target;</span></td>',
                '<td>Centraliza o mapa na sua ĺocalização.</td></tr>',
                '<tr><td><img class="leg" src="/assets/get-bike.png"></td>',
                '<td>Centraliza o mapa na estação mais próxima com bicicletas disponíveis.</td></tr>',
                '<tr><td><span class="quest-leg">&quest;</span></td>',
                '<td>Abre esta caixa de diálogo.</td></tr>',
                '</table>'].join('');


function setStContent(station) {

    var content = '<h2>Estação '+station.name+'</h2>';

    /* '<table><tr><th>Estado</th><th>Significado</th><th>Significado</th></tr>',
        '<tr><td><img class="leg" src="/assets/marker-person.png"></td>',
    '<td>Sua localização se disponível.</td></tr>',
                '<tr><td><img class="leg" src="/assets/marker-station.png"></td>',
                '<td>Estação de bicicletas, clique em alguma para obter informações.</td></tr>',
                '<tr><td><img class="leg" src="/assets/marker-bike.png"></td>',
                '<td>Bicicletas em uso no momento.</td></tr>',
                '<tr><td><span class="target-leg">&target;</span></td>',
                '<td>Centraliza o mapa na sua ĺocalização.</td></tr>',
                '<tr><td><img class="leg" src="/assets/get-bike.png"></td>',
                '<td>Centraliza o mapa na estação mais próxima com bicicletas disponíveis.</td></tr>',
                '<tr><td><span class="target-leg">&quest;</span></td>',
                '<td>Abre esta caixa de diálogo.</td></tr>',
                '</table>' */

    return content;
}


function updMarkers(item,type) {
    for (var i in markers) {
        if ((markers[i].typeElem === type) &&
            (markers[i].id === item[((type === typeElem.BIKE) ? "idbike":"idstation")])) {
                markers[i].dialog.setContent(setStContent(item))
                .setPopupContent(((type === typeElem.BIKE)?"Bike ":"Estação ") + item.name);
                markers[i].inst.setLatLng([item.lat,item.lon]);
                return;
        }
    }
    (type === typeElem.BIKE) ? setBkMarker(item): setStMarker(item);
}