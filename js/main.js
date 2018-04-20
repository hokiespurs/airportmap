
// Create Map
var mymap = L.map('map', {
    center: [48.244, -102.09961652755739],
    zoom: 3,
    maxZoom: 11,
    minZoom: 3,
    detectRetina: true // detect whether the sceen is high resolution or not.
});

// Add Basemap
L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png').addTo(mymap);

// Add Airports
// Generate Colormap
var coloroffset = 2; // skip first yellow colormaps
var colormap = chroma.scale('YlGnBu').mode('1ch').colors(9);
// Make a class to color each marker
for (i = 0; i < 8; i++) {
    $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colormap[i+coloroffset] + "; text-shadow: 0 0 3px #000000;} </style>"));
}

// Add airport markers
var airports = null;
var airport_levels = [5000, 10000, 50000, 100000, 500000, 1000000, 10000000];
airports= L.geoJson.ajax("assets/airports.geojson",{
    onEachFeature: function(feature, layer){
        layer.bindPopup(feature.properties.AIRPT_NAME + "<br> Total Enplanements Per Year(2012) : " + numberWithCommas(feature.properties.TOT_ENP));
    },
    pointToLayer: function(feature,latlng) {
        // set markersize based on 'big-airport' or 'small-airport' class
        var markerclass = 'small-airport';
        if (feature.properties.CNTL_TWR == "Y") {markerclass='big-airport';}
        // set marker color based on TOT_ENP
        let enp = feature.properties.TOT_ENP;
        var i;
        for (i=0;i<8;i++){
            if (enp < airport_levels[i]) {break;}
        }

        return L.marker(latlng, {icon: L.divIcon({className: 'fa fa-plane ' + markerclass + ' marker-color-' + (i +1).toString()})});
    },
    attribution: 'Airport Data &copy; USGS | US States &copy; Mike Bostocks | Basemap &copy; CartoDB | Made By Richie Slocum'
});

airports.addTo(mymap);



// Load States
L.geoJson.ajax('assets/us-states.geojson',{style: statestyle}).addTo(mymap);

// Add Scale for states
state_colormap = chroma.scale('OrRd').colors(5);
const state_levels = [10, 20, 30, 40];
function setStateColor(count) {
    var id;
    for (id=0;id<4;id++) {
        if (count<state_levels[id]) {break;}
    }
    return state_colormap[id];
}

function statestyle(feature) {
    return {
        fillColor: setStateColor(feature.properties.count),
        fillOpacity: 0.3,
        weight: 2,
        opacity: 1,
        color: '#000000',
        dashArray: '4'
    }

}

// Add Legend
var legend = L.control({position: 'topright'});

legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'legend');
    // add airports per state
    div.innerHTML += '<b># Airports per State</b><br />';
    div.innerHTML += '<i style="background: ' + state_colormap[4] + '; opacity: 0.5"></i><p>' + state_levels[3].toString() + '+</p>';
    div.innerHTML += '<i style="background: ' + state_colormap[3] + '; opacity: 0.5"></i><p>' + state_levels[2].toString() + ' - ' + (state_levels[3]-1).toString() + '</p>';
    div.innerHTML += '<i style="background: ' + state_colormap[2] + '; opacity: 0.5"></i><p>' + state_levels[1].toString() + ' - ' + (state_levels[2]-1).toString() + '</p>';
    div.innerHTML += '<i style="background: ' + state_colormap[1] + '; opacity: 0.5"></i><p>' + state_levels[0].toString() + ' - ' + (state_levels[1]-1).toString() + '</p>';
    div.innerHTML += '<i style="background: ' + state_colormap[0] + '; opacity: 0.5"></i><p> < ' + state_levels[0] + '+</p>';
    // add control tower marker size
    div.innerHTML += '<hr><b>Control Tower<b><br />';
    div.innerHTML += '<i class="fa fa-plane big-airport"></i><p> Towered Airport</p>';
    div.innerHTML += '<i class="fa fa-plane small-airport"></i><p> Airport w/o Tower</p>';
    // add total enplanements
    div.innerHTML += '<hr><b>Total Enplanements<b><br />';
    div.innerHTML += '<i class="fa fa-plane marker-color-8 big-airport"></i><p> > ' + numberWithCommas(airport_levels[6]) + '</p>';
    var i;
    for (i=5;i>=0;i--){
        div.innerHTML += airplaneLegend(i,airport_levels[i]+1,airport_levels[i+1]);
    }
    div.innerHTML += '<i class="fa fa-plane marker-color-1 big-airport"></i><p> < ' + numberWithCommas(airport_levels[0]) + '</p>';
    return div;
};

function airplaneLegend(i,low,high){
    var str = '';
    str += '<i class="fa fa-plane marker-color-' + (i+2).toString() + ' big-airport"></i>';
    str += '<p> ' + numberWithCommas(low) + ' - ' + numberWithCommas(high) + '</p>';
    return str;
}

legend.addTo(mymap);
// add scalebar
L.control.scale({position: 'bottomleft'}).addTo(mymap);


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}