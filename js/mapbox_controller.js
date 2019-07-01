function popup_info_on_click(map, e, elem){
    var SymbolLayer = 'symbol_' + elem;
    var PntDenue = map.queryRenderedFeatures(e.point, {layers: [SymbolLayer]});
    if(PntDenue.length){
        var q = PntDenue[0].properties;
        var dir = JSON.parse(q.direccion);
        var html2 = '<b>[categoria]</b>: ' + q.categoria +
                    '<br><b>[nombre]</b>: '+ q.nom_estab +
                    '<br><b>[raz_social]</b>: ' + q.raz_social +
                    '<br><b>[actividad]</b>: ' + q.nombre_act +
                    '<br><b>[dirección]</b>: ';
        for (var j = 0; j < dir.length; j++){
            html2 += '<br>  ' + dir[j];
        }
        html2 += '<br><b>[sitio : ]</b>: ' + q.sitio_web +
                 '<br><b>[fecha alta : ]</b>: ' + q.fecha_alta;
        var div = window.document.createElement('div');
        div.innerHTML = html2;
        div.style.overflow = 'scroll';
        div.style.height = '140px';
        new mapboxgl.Popup().setLngLat(e.lngLat).setDOMContent(div).addTo(map);
    }

}

function popup_info_on_click_4sqr(map, e, elem){
    var PointsLayer = 'symbol_' + elem;
    var PntVean = map.queryRenderedFeatures(e.point, {layers: [PointsLayer]});
    if(PntVean.length){
        var p = PntVean[0].properties;
        var addr = JSON.parse(p.address);
        //var html = '<b>[usr_id]</b>: ' + p.name +
        var html = '<b>[category]</b>: ' + p.category +
                   '<br><b>[address]</b>: ';
        for (var i = 0; i < addr.length; i++) {
            html += '<br>  ' + addr[i];
        }
        var div = window.document.createElement('div');
        div.innerHTML = html;
        div.style.overflow = 'scroll';
        div.style.height = '110px';
        new mapboxgl.Popup().setLngLat(e.lngLat).setDOMContent(div).addTo(map);
    }
}



function left_legend_color_bar(elem){
    // Legend Color Bar
    var color_category_data = 'data/legend_' + elem + '.json';
    $.when(
        $.getJSON(color_category_data),
        //$.getJSON("data/legend_count.json")
    ).done(function(Colors, Count) {
        legend_left.innerHTML = "";
        for(i in Colors){
            var layer = i;// + '<b>['+ Count[i] +']</b>: ';
            var color = Colors[i];
            var item = document.createElement('div');
            var key = document.createElement('span');
            key.className = 'legend_left-key';
            key.style.backgroundColor = color;

            var value = document.createElement('span');
            value.innerHTML = layer;
            item.appendChild(key);
            item.appendChild(value);
            legend_left.appendChild(item);
        }
    });
}

// Función de detalles de puntos Venues
function load_points_layer(map, elem){
    // Load data points
    var SOURCE = 'Points_' + elem;
    var DATA = './data/geojson/' + elem + '.json';
    map.addSource(SOURCE,{
        type: 'geojson',
        data: DATA
    });
    // Set Layers
    var ID = 'point_' + elem;
    var Symbol = 'symbol_' + elem;
    if (elem == '4square_CDMX'){
        // 4square veanues circle points
        map.addLayer({
            'id': ID,
            'type': 'circle',
            'source': SOURCE,
            'layout': {
                'visibility': 'none'
            },
            'paint': {
                'circle-radius':{
                    'base': 1.75,
                    'stops': [[12, 3], [22, 180]]
                },
                'circle-color' : ['get', 'color_cat'],
                'circle-opacity' : 0.9,
            }
        });

    } else {
        map.addLayer({
            'id': ID,
            'type': 'circle',
            'source': SOURCE,
            'layout': {
                'visibility': 'none'
            },
            'paint': {
                'circle-radius':{
                    'base': 1.75,
                    'stops': [[12, 3], [22, 180]]
                },
                'circle-color' : ['get', 'color_cat'],
                'circle-opacity' : 0.9,
                //'circle-blur' : 0.5,
                'circle-stroke-width' : 2,
                'circle-stroke-color' : '#000000'
            }
        });
    }
    // Symbol
    map.addLayer({
        'id': Symbol,
        'type': 'symbol',
        'source': SOURCE,
        'layout': {
            'visibility': 'none',
            'text-field': "'",
            'text-font': [
                'DIN Offc Pro Medium',
                'Arial Unicode MS Bold'
            ],
            'text-size': 15
        }
    });

    var PntLayer = 'point_' + elem;
    // Pointer effect on hover
    map.on('mouseenter', PntLayer, function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', PntLayer, function () {
        map.getCanvas().style.cursor = '';
    });

    // Actions on click
    map.on('click', function(e){
        if (elem == '4square_CDMX'){
            popup_info_on_click_4sqr(map, e, elem)
        }
        else{
            popup_info_on_click(map, e, elem);
        }
    });

}

function add_remove_layer(map, Layer_) {
    var id = Layer_;
    var POINT = '';
    var SYMBOL = 'symbol_' + id;
    var SOURCE = '';
    var link = document.createElement('a');
    var loadedLayers = [];
    link.href = '#';
    link.className = 'inactive';
    link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();
        POINT =  'point_' + clickedLayer;
        SOURCE = 'Points_' + clickedLayer;
        if(map.isSourceLoaded(SOURCE)){
            loadedLayers.push(SOURCE)
        }
        else{
            load_points_layer(map, clickedLayer);
        }
        var visibility = map.getLayoutProperty(POINT, 'visibility');
        // Find the index of the first symbol layer in the map style

        //for (var i = 0; i < layers.length; i++) {
        //    if (layers[i].type === 'symbol') {
        //        loadedLayers.push(layers[i])
        //        break;
        //    }
        //}
        // map.removeLayer()
        if(loadedLayers.length > 2){
            map.removeSource(loadedLayers[0])
            loadedLayers.shift();
        }

        // map.removeSource('route')
        if (visibility === 'visible') {
            this.className = '';
            map.setLayoutProperty(POINT, 'visibility', 'none');
            map.setLayoutProperty(SYMBOL, 'visibility', 'none');
        } else {
            this.className = 'active';
            map.setLayoutProperty(POINT, 'visibility', 'visible');
            map.setLayoutProperty(SYMBOL, 'visibility', 'visible');
            left_legend_color_bar(id);
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
    return link;
}

function display_layer(map, LayGeo){



}


// Función principal
// Levanta requerimientos para cargar mapa
function cargar_mapa(ruta_archivo){
    mapboxgl.accessToken = 'pk.eyJ1IjoibWlsbzgwMCIsImEiOiJjaXVyMXJyYmowMDVlMnlxeGNrcWplbTgxIn0.HLuNoJhMYaSb04Wl9oAFBQ';
    var map = new mapboxgl.Map({
    container: 'mapid',
    style: 'mapbox://styles/mapbox/streets-v11',
    //style: 'mapbox://styles/mapbox/dark-v10',
    center: [-99.14, 19.4],
    zoom: 11
    });

    var LayersGeojson = ['4square_CDMX', 'denue_PCT', 'denue_PorMenor1'];

    map.on('load', function(){
        // Load Layers from LayersGeojson
        /*
        for (var i = 0; i < LayersGeojson.length; i++){

            load_points_layer(map, LayersGeojson[i]);

        }

        */


        // Navigation map tools
        map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new mapboxgl.GeolocateControl());
    });

    for(var i = 0; i < LayersGeojson.length; i++){
        add_remove_layer(map, LayersGeojson[i]);
    }

}



$(document).ready(function() {
    cargar_mapa("./data/geojson/veanues_data.json");

});
