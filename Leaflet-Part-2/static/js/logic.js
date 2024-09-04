
let eq_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let tp_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

function createMap(earthquakes, tectonicPlates) {

  // Adding the base tile layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlayMaps object to hold the tectonicPlates and earthquakes layer.
  let overlayMaps = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
  };
  
  // Creating the map object. This is the default.
  let myMap = L.map("map", {
    center: [20, 90],
    zoom: 3,
    layers: [street, tectonicPlates, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

      // Set up the legend.
      let legend = L.control({ position: "bottomright" });
      legend.onAdd = function (myMap) {
          let div = L.DomUtil.create("div", "info legend");
          let limits = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
          let colours = ["#f0dba5", "#e89343", "#e86143", "#b3296e", "#8e33a1", "#380a7d"];
       
      // Add the limit values
      let legendInfo = "<h3>Depth</h3>";
        
      div.innerHTML = legendInfo;
      let labels = [];
  
      limits.forEach(function(limit, index) {
          div.innerHTML += `<i style="background: ${colours[index]}"></i> ${limit}<br>`;
      });
  
      return div;
      };
  
      // Adding the legend to the map
      legend.addTo(myMap);
}

  // The function that will determine the colour based on depth
function chooseColour(depth) {
    if (depth >=90 ) return "#380a7d";
    else if (depth >= 70) return "#8e33a1";
    else if (depth >= 50) return "#b3296e";
    else if (depth >= 30) return "#e89343";
    else if (depth >= 10) return "#e86143";
    else return "#f0dba5";
}

// Define a createCircle() function that will feature a radius based on its magnitude and behave like a marker so that it does not
// cloud the map details when zooming in.
function markerSize(magnitude) {
    // console.log(magnitude);
    if (magnitude < "0") return (magnitude = "0")
    return Math.sqrt(magnitude) * 8;
}

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

//   Get the earthquake data with d3.
d3.json(eq_url).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data  
  let earthquakes = L.geoJson(data, {
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
    });

  // Getting the tectonic plate data with d3
  d3.json(tp_url).then(function(tect) {
    console.log(tect);
    // Once we get a response,
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let tectonicPlates = L.geoJSON(tect, {
      // Styling each feature (in this case, a neighbourhood)
      style: function(feature) {
        return {
          color: "yellow",
          weight: 1.5
        };
      }
    });
  
    // Send our tectonic plate layer to the createMap function
  createMap(earthquakes, tectonicPlates);
  });
});

