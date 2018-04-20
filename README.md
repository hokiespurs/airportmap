# Airport Map of the USA (airportmap)
### Overview

This project demonstrates using Leaflet to visualize the airports in the United States.  Each airport is indicated by an airplane shaped marker which is colored by the number of enplanements per year.  The size of the airplane marker indicates whether the airport has a tower.  A polygon representing each state is overlaid on the basemap, where the color indicates the number of airports in each state.

> Enplanement (def) : to board an airplane (www.dictionary.com)

![Example Display](https://github.com/hokiespurs/airportmap/blob/master/img/example.png)

## Functionality

#### Map Initialization

The mapping functionality is implemented using the [Leaflet](http://leafletjs.com/) Javascript library, and initialized using an `L.map('map',args)` call in `main.js`.  The map placed in an html `<div>` element, which is set to take up the whole page using a style in `main.css`.

**main.css**

```css
html, body, #map { 
    width: 100%; 
    height: 100%; 
    margin: 0; 
    background: #fff; 
}
```

**main.js**

```javascript
// Create Map
var mymap = L.map('map', {
    center: [48.244, -102.09961652755739],
    zoom: 3,
    maxZoom: 11,
    minZoom: 3,
    detectRetina: true // detect whether the sceen is high resolution or not.
});
```

**index.html**

```html
<body>
<div id="map"></div>
</body>
```

#### Load and visualize geojson of airplane data

**main.css**

```css
.big-airport {    font-size: 20px;}
.small-airport {    font-size: 12px;}
```

**main.js**
First, a colormap is generated using [chroma.js](https://github.com/gka/chroma.js/) and added to the head as `css` styles named `.marker-color-<1-9>` to so that the markers may be colored easily. A color offset is used to skip the first very light color in the colormap.
``` javascript
// Generate Colormap
var coloroffset = 2; // skip first yellow colormaps
var colormap = chroma.scale('YlGnBu').mode('1ch').colors(9);
// Make a class to color each marker
for (i = 0; i < 8; i++) {
    $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colormap[i+coloroffset] + "; text-shadow: 0 0 3px #000000;} </style>"));
}
}
```

Then, the airport geojson is loaded using [leaflet-ajax](https://github.com/calvinmetcalf/leaflet-ajax) and added to the map using the Leaflet geoJson functionality.

```js
airports= L.geoJson.ajax("assets/airports.geojson",{
...
airports.addTo(mymap);
```

A popup is added to each airport using the `onEachFeature` call and binding a popup to each marker.  The html for the popup is set from the geoJson properties.

```js
airports= L.geoJson.ajax("assets/airports.geojson",{
    onEachFeature: function(feature, layer){
        layer.bindPopup(feature.properties.AIRPT_NAME + "<br> Total Enplanements Per Year(2012) : " + numberWithCommas(feature.properties.TOT_ENP));
    },
```
The color and size of the marker are set using the `pointToLayer` call.  The variable `markerclass` holds either `'small-airport'` or `'big-airport'`, which indicates the css styling to resize the icon.  The icon chosen is the `fa-plane` icon, from the [Font Awesome](https://fontawesome.com/icons) library.  The variable `airport_levels` is used to set the correct styling index (`.marker-color-<1-9>`).
```js
var airport_levels = [5000, 10000, 50000, 100000, 500000, 1000000, 10000000];
...
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
        	return L.marker(latlng, {icon: L.divIcon({className: 'fa fa-plane ' + 					markerclass + ' marker-color-' + (i +1).toString()})});
    },
```

The attribution at the bottom of the map is added to indicate the sources of the data, and the author of the map. 

```javascript
    attribution: 'Airport Data &copy; USGS | US States &copy; Mike Bostocks | Basemap &copy; CartoDB | Made By Richie Slocum'
```

#### Load and visualize geojson of US state data 

**main.js**

The US state data is loaded using the same `L.geoJson` call, however the styling is handled in a slightly different manner. The style is set using inline css from function calls to `statestyle(feature)` and `setStateColor`.  

```js
// Load States
L.geoJson.ajax('assets/us-states.geojson',{style: statestyle}).addTo(mymap);

// Add Scale for states
state_colormap = chroma.scale('OrRd').colors(5);
function setStateColor(count) {
    var id = 0;
    if (count<10) {id=0;}
    else if (count<20) {id=1;}
    else if (count<30) {id=2;}
    else if (count<40) {id=3;}
    else {id=4;}

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
```

#### Generate Legend

![Legend](https://github.com/hokiespurs/airportmap/blob/master/img/example_legend.PNG)

**main.css**

The legend is styled using css so that all of the elements line up.

```css
.legend {
    line-height: 18px;
    width: 160px;
    color: #333333;
    font-family: 'Titillium Web', sans-serif;
    padding: 6px 8px;
    background: white;
    background: rgba(255,255,255,0.9);
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
    border-radius: 5px;
}

.legend i {
    width: 18px;
    height: 18px;
    text-align: center;
    vertical-align: middle;
    line-height: 18px;
    float: left;
    margin-right: 8px;
    opacity: 0.9;
}

.legend img {
    width: 18px;
    height: 18px;
    margin-right: 3px;
    float: left;
}

.legend p {
    font-size: 13px;
    line-height: 18px;
    margin: 0;
}
```

**main.js**

The legend is added using a div icon, where the `innerHTML` is incrementally added.  The CSS ensures appropriate spacing for each of the fields.  

```js
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
```

#### Add Scalebar

**main.js**

```js
L.control.scale({position: 'bottomleft'}).addTo(mymap);
```

## Folder Structure

The repository is structured based on the following folder structure.
```
|-- airportmap
    |-- README.md
    |-- index.html
    |-- assets
    |   |-- airports.geojson
    |   |-- us-states.geojson
    |-- css
    |   |-- main.css
    |-- img
    |   |-- example.png
    |-- js
        |-- main.js
```

## Attribution
### Data Sources
- Airport data downloaded from [USGS](https://www.sciencebase.gov/catalog/item/581d0516e4b08da350d52379)
- US States from [Mike Bostocks](https://bost.ocks.org/mike/)

### Libraries
- Map functionality from [Leaflet](http://leafletjs.com/)
- Icons from [Font Awesome](https://fontawesome.com/icons?d=gallery&m=free)
- Font from [google](https://fonts.google.com/specimen/Titillium+Web)
- geojson loading from [Leaflet-ajax](https://github.com/calvinmetcalf/leaflet-ajax)
- javascript enhancement using [jQuery](https://jquery.com/)
- Colormap from [chroma.js](https://gka.github.io/chroma.js/)
