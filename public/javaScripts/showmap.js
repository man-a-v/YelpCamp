mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: campground.geometry.coordinates,//[12.554729, 55.70651], // starting position [lng, lat]
zoom: 10, // starting zoom
projection: 'globe' // display the map as a 3D globe
});
const marker1 = new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates) //(long,lat)
.setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h4>${campground.title}</h4><p>${campground.location}</p>`//backticks shld enclose html tags too
    )
)
.addTo(map);
//dont gotta remember anyof this 
//always consult the docs
map.addControl(new mapboxgl.NavigationControl());