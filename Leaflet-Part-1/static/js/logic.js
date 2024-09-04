// Creating the map object
let myMap = L.map("map", {
    center: [20, 90],
    zoom: 3
  });
  
  // Adding the tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

  let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
  

  // The function that will determine the colour based on depth
function chooseColour(depth) {
    if (depth >=90 ) return "#380a7d";
    else if (depth >= 70) return "#8e33a1";
    else if (depth >= 50) return "#b3296e";
    else if (depth >= 30) return "#e89343";
    else if (depth >= 10) return "#e86143";
    else return "#f0dba5";
}

// Define a markerSize() function that will featurea radius based on its magnitude
function markerSize(magnitude) {
    // console.log(magnitude);
    if (magnitude < "0") return (magnitude = "0")
    return Math.sqrt(magnitude) * 8;
}

// Define a createCircle() function that will feature a radius based on its magnitude and behave like a marker so that it does not
// cloud the map details when zooming in.
function createCircle(feature, latlng) {
  return L.circleMarker(latlng, {
    fillOpacity: 1,
    color: "grey",
    weight: 1,
    // Setting our circle's colour to equal the output of our chooseColour() function:
    // This will make our marker's colour proportionate to its depth.
    fillColor: chooseColour(feature.geometry.coordinates[2]),
    // Setting our circle's radius to equal the output of our markerSize() function:
    // This will make our marker's size proportionate to its magnitude.
    radius: markerSize(feature.properties.mag)
    }); 
}

//   Get the data with d3.
d3.json(url).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data  
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      // Call the function to create circles instead of regular point markers
      return createCircle(feature, latlng);
    },

    // This is called on each feature
    onEachFeature: function(feature, layer) {

      // Set the mouse events to change the map styling.
      layer.on({
        // When a user's mouse cursor touches a map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
        mouseover: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.6
          });
        },
        // When the cursor no longer hovers over a map feature (that is, when the mouseout event occurs), the feature's opacity reverts back to 50%.
        mouseout: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 1
          });
        },
      });
      
      layer.bindPopup("<strong>" + feature.properties.place + "</strong><br /><br /><hr>Magnitude: " +
        feature.properties.mag + "<br /><br />Depth: " + feature.geometry.coordinates[2] + 
        "<br /><br />Time: " + new Date(feature.properties.time));
    }
    }).addTo(myMap);
});

    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function (myMap) {
        let div = L.DomUtil.create("div", "info legend");
        let limits = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
        let colours = ["#f0dba5", "#e89343", "#e86143", "#b3296e", "#8e33a1", "#380a7d"];
     
    // Add the limit values
    let legendInfo = "<h3>Depth</h2>";
      
    div.innerHTML = legendInfo;
    let labels = [];

    limits.forEach(function(limit, index) {
        div.innerHTML += `<i style="background: ${colours[index]}"></i> ${limit}<br>`;
    });

    return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
