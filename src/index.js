import mapboxgl from 'mapbox-gl';
import { location } from './const.js';
import data from './geojson.json';

const { nakanoshima, sunshine60 } = location;
mapboxgl.accessToken = 'pk.eyJ1IjoibXRzbm93IiwiYSI6ImNrbzN3YmxzaTBocDIycG1samg5b2hoYm4ifQ.KAbQSw_coyJY103rU_tkUg';


const init = () => {
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mtsnow/ckoav8v1o0e7i17ljjw5cgex2', // stylesheet location
    center: sunshine60, // starting position [lng, lat]
    zoom: 7 // starting zoom
  });
  const markers = [sunshine60, nakanoshima].map(loc => 
    new mapboxgl.Marker()
    .setLngLat(loc)
    .addTo(map)
  );
  map.on('load', () => {
    map.addSource('distance', {type: "geojson", data});
    map.addLayer({
      'id': 'places',
      'type': 'circle',
      'source': 'distance',
      'paint': {
        //'circle-blur': 0.6,
        'circle-color': [
          'step',
          ['max', ['get', 'time_sunshine60'], ['get', 'time_nakanoshima']],
          '#61FF33',
          60,
          '#377eb8',
          90,
          '#e41a1c'
        ]
      }
    });
    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
    map.on('mouseenter', 'places', function (e) {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';

      var coordinates = e.features[0].geometry.coordinates.slice();
      //var description = e.features[0].properties.name;
      var description = "<strong>"
        + e.features[0].properties.name
        + "</strong><ul>"
        + "<li>Time(サンシャイン): " + e.features[0].properties.time_sunshine60 + "</li>"
        + "<li>乗り換え回数(サンシャイン): " + e.features[0].properties.transit_count_sunshine60 + "</li>"
        + "<li>Time(中野島): " + e.features[0].properties.time_nakanoshima + "</li>"
        + "<li>乗り換え回数(中野島): " + e.features[0].properties.transit_count_nakanoshima + "</li>"
        + "</ul>";

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });

    map.on('mouseleave', 'places', function () {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });
  });
  window.map = map;

  const init_slider_events = () => {
    const values = {
      sunshine60: 180, nakanoshima: 180
    };
    const sliders = document.getElementsByClassName('slider');
    const slider_values = document.getElementsByClassName('slider-value');
    Array.from(sliders).forEach(element => {
      element.addEventListener('input', (e) => {
        const key = e.target.dataset.target;
        const slider_value = document.querySelector(`#fields-${key} .slider-value`);
        values[key] = parseInt(e.target.value, 10);
        slider_value.innerText = values[key]
        set_filter();
      });
    });
    Array.from(slider_values).forEach(element => {
      element.addEventListener('input', (e) => {
        const key = e.target.dataset.target;
        const slider = document.querySelector(`#fields-${key} .slider`);
        values[key] = Math.max(0, Math.min(180, parseInt(e.target.innerText, 10)));
        slider.value = values[key];
        set_filter();
      });
    });
    const set_filter = () => {
      map.setFilter('places',
          ['all', ['<=', ['get', 'time_sunshine60'], values.sunshine60],
                  ['<=', ['get', 'time_nakanoshima'], values.nakanoshima]]
      );
    };
  };
  init_slider_events();
}
document.addEventListener("DOMContentLoaded", init);
