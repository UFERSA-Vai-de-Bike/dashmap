// Inicialização
window.onload = function() {
    console.log('Window is loaded!' );
    initMap();
    checkGeoLocation();
    checkAPI();
    // loadStub();
}

// Configuração de rede
var baseUrl = "http://localhost:3000/api/";
var myHeaders = new Headers();
var myGet = { method: 'GET',
               headers: myHeaders,
               mode: 'cors', 
               cache: 'default' };

// configuração de tipos
var typeElem = {
    BIKE: 1,
    STATION: 2 
}

//  localização da ufersa (testes)
var ufersaLatLng = [-5.2015139, -37.3254804];

// variáveis do mapa
var map, mcg, meMarker, markers = [], welcomeDialog, welcomeBtn, stNearBtn;

// Configuração do marker do usuário
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

// configuração do marker das estações
function setStMarker(station) {
    markers.push(
        {
            id: station.idstation,
            typeElem: typeElem.STATION,
            name: station.name,
            slots: station.slots,
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
// configuração do marker das bicicletas
function setBkMarker(bike) {
    markers.push(
        {
            id: bike.idbike,
            name: bike.name,
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

// configuração do mapa
function initMap() {
    map = L.map('mapid').setView(ufersaLatLng, 17); // zoom max 18
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // markerscluster
    mcg = L.markerClusterGroup().addTo(map);
    mcg1 = L.markerClusterGroup().addTo(map);

    // botão da dialog de legenda
    welcomeBtn = L.easyButton( '<span class="quest">&quest;</span>', function(){
        this.disable();
        welcomeDialog.open();
      }).addTo(map);
    welcomeBtn.disable();

    // dialog de legenda
    welcomeDialog = L.control.dialog()
          .setContent(welcontent)
          .addTo(map);
    
    map.on('dialog:closed', function(e){
        if (e._leaflet_id === 72) welcomeBtn.enable();
    });


    // logo do projeto
    L.control.custom({
        position: 'bottomright',
        content : '<img src="/assets/logo.png" class="img-thumbnail">',
        style   :
        {
            height: '100px',
            width: '100px',
            margin: '0px 20px 20px 0',
            padding: '0px',
        },
    })
    .addTo(map);


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

// conexão primária coma a API
function checkAPI() {
    fetch(baseUrl,myGet).then(function (response) {
        return response;
    }).then(function (res) {
        if (res.status === 200) {
            res.text().then(function(data) {
                console.log(data);
            });
            // requisiçoes
            loadStations();
            loadBikesOnRide();

            // chamando loop de requisição
            // callThread();
        }
    });
}

// loop de requisição
function callThread() {
    setTimeout(checkAPI,5000);
}

// requisição para carregar as estações válidas
function loadStations() {
    fetch(baseUrl + "stations/val",myGet).then(function (response) {
        return response;
    }).then(function (res) {
        // console.log(res);
        if (res.status === 200) {
            res.json().then(function(res) {
                // console.log(res.data);
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
                    station.slots = station.slots.sort(function(a,b){
                        return a.f1 - b.f1;
                    }); 
                    updMarkers(station,typeElem.STATION);
                });
                // todo start thread
            });
        }
    });
}
// função para centralizar o mapa na estação mais próxima do usuário
function toNeareSt(latLng) {
    var mindif = 99999;
    var closest;
    var stMarkers = [];
    markers.forEach(function(item){
        if (item.typeElem === typeElem.STATION) {
            stMarkers.push(item.inst.getLatLng());
        }
    });
    for (var i in stMarkers) {
      var dif = PythagorasEquirectangular(latLng, stMarkers[i]);
      if (dif < mindif) {
        closest = i;
        mindif = dif;
      }
    }
    // console.log(closest);
    map.flyTo(stMarkers[closest]);
    stNearBtn.enable();
}
// funções auxiliares
// Convert Degress to Radians
function Deg2Rad(deg) {
    return deg * Math.PI / 180;
}
function PythagorasEquirectangular(latLng, latLng1) {
    var lat1 = Deg2Rad(latLng.lat);
    var lat2 = Deg2Rad(latLng1.lat);
    var lng1 = Deg2Rad(latLng.lng);
    var lng2 = Deg2Rad(latLng1.lng);
    var R = 6371; // km
    var x = (lng2 - lng1) * Math.cos((lat1 + lat2) / 2);
    var y = (lat2 - lat1);
    var d = Math.sqrt(x * x + y * y) * R;
    return d;
}


// requisição para carregar as bicicletas
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
        // console.log(position.coords);
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

function updMarkers(item,type) {
    for (var i in markers) {
        if ((markers[i].typeElem === type) &&
            (markers[i].id === item[((type === typeElem.BIKE) ? "idbike":"idstation")])) {
                
                if (type === typeElem.STATION){
                    if (markers[i].slots.length !== item.slots.length) {
                        var isClose =  markers[i].dialog.isClose();
                        markers[i].dialog.setContent(setStContent(item));
                        if (isClose) markers[i].dialog.close();
                    } else {
                        for (var k in item.slots) {
                            if (markers[i].slots[k].f2 !== item.slots[k]) {
                                var isClose =  markers[i].dialog.isClose();
                                markers[i].dialog.setContent(setStContent(item));
                                if (isClose) markers[i].dialog.close();
                                break;
                            }
                        }
                    }
                }
                
                if (markers[i].name !== item.name) {
                    markers[i].name = item.name
                    markers[i].inst.setTooltipContent(((type === typeElem.BIKE)?"Bike ":"Estação ") + item.name);
                }

                var latLng = markers[i].inst.getLatLng() 
                if ((latLng.lat !== item.lat) || (latLng.lng !== item.lon))
                    markers[i].inst.setLatLng([item.lat,item.lon]);
                return;
        }
    }
    (type === typeElem.BIKE) ? setBkMarker(item): setStMarker(item);
}

function loadStub() {
    var contentSt = setStContent(stationsStub[2]);


    document.getElementById("mapid").innerHTML = contentSt;
}

function setStContent(station) {

    var ct = '<h2>Estação '+station.name+'</h2>';
    if (station.slots.length) {
        ct += '<div style="text-align: right;">'
        ct += '<h5>間 Vazio</h5>'
        ct += '<h5><i class="fa fa-bicycle" aria-hidden="true"> Bicicleta disponível</h5></div>'
        ct += '<table><tr><th style="text-align: center;">Vaga</th><th style="text-align: center;">Estado</th></tr>';

        station.slots.forEach(function(slot){
            ct += '<tr><td>'+slot.f1+'</td>';
            ct += '<td>'+( slot.f2 ? '<i class="fa fa-bicycle fa-2x" aria-hidden="true"></i>' : '<h3>間</h3>' )+'</td></tr>';
        })
        ct += '</table>'
    } else {
        ct += '<p>Nenhuma informação disponível</p>'
    }

    return ct;
}

var welcontent = ['<h2>UFERSA Vai de Bike</h2><p>Bem vindo ao mapa do sistema UFERSA Vai de bike.',
                '</p><p>Abaixo segue uma breve legenda.</p>',
                '<table><tr><th style="text-align: center;">Ícone</th><th style="text-align: center;">Significado</th></tr>',
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


var stationsStub = [
    {
        "idstation": 3,
        "name": "Sang",
        "lat": -5.203151,
        "lon": -37.327629,
        "slots": [
            {
                "f1": 1,
                "f2": false
            },
            {
                "f1": 2,
                "f2": true
            },
            {
                "f1": 3,
                "f2": false
            },
            {
                "f1": 4,
                "f2": false
            }
        ]
    },
    {
        "idstation": 4,
        "name": "Milda",
        "lat": -5.201565,
        "lon": -37.325744,
        "slots": [
            {
                "f1": 1,
                "f2": false
            },
            {
                "f1": 2,
                "f2": false
            },
            {
                "f1": 3,
                "f2": true
            },
            {
                "f1": 4,
                "f2": true
            }
        ]
    },
    {
        "idstation": 2,
        "name": "Olimpia",
        "lat": -5.207059,
        "lon": -37.323857,
        "slots": [
            {
                "f1": 1,
                "f2": false
            },
            {
                "f1": 2,
                "f2": false
            },
            {
                "f1": 4,
                "f2": true
            },
            {
                "f1": 4,
                "f2": false
            }
        ]
    },
    {
        "idstation": 1,
        "name": "Aliada",
        "lat": -5.20437,
        "lon": -37.323554,
        "slots": [
            {
                "f1": 1,
                "f2": false
            },
            {
                "f1": 2,
                "f2": false
            },
            {
                "f1": 3,
                "f2": false
            },
            {
                "f1": 4,
                "f2": false
            }
        ]
    }
]


var bikeStub = [
    {
        "idbike": 1,
        "idstation": 1,
        "name": "Eugena",
        "regdate": "2018-09-03T03:39:38.732Z",
        "lat": -5.204424,
        "lon": -37.323591,
        "slot": 1,
        "state": true,
        "onride": true
    },
    {
        "idbike": 2,
        "idstation": 1,
        "name": "Leanne",
        "regdate": "2018-09-03T03:39:38.743Z",
        "lat": -5.204663,
        "lon": -37.32325,
        "slot": 2,
        "state": true,
        "onride": true
    },
    {
        "idbike": 3,
        "idstation": 2,
        "name": "Tawana",
        "regdate": "2018-09-03T03:39:38.754Z",
        "lat": -5.206759,
        "lon": -37.323583,
        "slot": 1,
        "state": true,
        "onride": true
    },
    {
        "idbike": 5,
        "idstation": 3,
        "name": "Loraine",
        "regdate": "2018-09-03T03:39:38.776Z",
        "lat": -5.203072,
        "lon": -37.32763,
        "slot": 1,
        "state": true,
        "onride": true
    }
]