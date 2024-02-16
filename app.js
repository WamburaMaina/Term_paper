// Load GeoJSON data for counties
fetch("Laikipia_county.geojson")
  .then((response) => response.json())
  .then((countiesData) => {
    // Initialize the map
    var map = L.map("map");

    // Ading the tile layers
    var osmLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    );
    var esriLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community",
      }
    );

    osmLayer.addTo(map); // Default layer

    // Add GeoJSON layer for counties
    var countiesLayer = L.geoJSON(countiesData, {
      style: {
        fillColor: "lightblue",
        weight: 2,
        opacity: 1,
        color: "red",
        fillOpacity: 0.7,
      },
    }).addTo(map);

    // Log to check if GeoJSON data for counties is loaded successfully
    console.log("GeoJSON data for counties loaded:", countiesData);

    // Load GeoJSON data for constituency
    fetch("Constituency.geojson")
      .then((response) => response.json())
      .then((constituencyData) => {
       
        var constituencyLayer = L.geoJSON(constituencyData, {
          style: {
            fillColor: "orange",
            weight: 2,
            opacity: 1,
            color: "black",
            fillOpacity: 0.7,
          },
        });

        // Log to check if GeoJSON data for constituency is loaded successfully
        console.log("GeoJSON data for constituency loaded:", constituencyData);

        // Load GeoJSON data for sub-county
        fetch("Sub_county.geojson")
          .then((response) => response.json())
          .then((subCountyData) => {
            // Add GeoJSON layer for sub-county
            var subCountyLayer = L.geoJSON(subCountyData, {
              style: {
                fillColor: "none",
                weight: 2,
                opacity: 1,
                color: "black",
                fillOpacity: 0.7,
              },
            });

            // Log to check if GeoJSON data for sub-county is loaded successfully
            console.log("GeoJSON data for sub-county loaded:", subCountyData);

            // Load GeoJSON data for health centers
            fetch("Health_centers.geojson")
              .then((response) => response.json())
              .then((healthCentersData) => {
                // Add GeoJSON layer for health centers
                var healthCentersLayer = L.geoJSON(healthCentersData, {
                  pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                      radius: 4, // Set the marker radius to 4
                      fillColor: "red",
                      color: "red",
                      weight: 1,
                      opacity: 1,
                      fillOpacity: 0.8,
                    });
                  },
                });

                // Log to check if GeoJSON data for health centers is loaded successfully
                console.log(
                  "GeoJSON data for health centers loaded:",
                  healthCentersData
                );

                // Create layer groups for better control
                var baseLayers = {
                  OpenStreetMap: osmLayer,
                  "ESRI Imagery": esriLayer,
                };

                var geoJsonLayers = {
                  "Health Centers": healthCentersLayer,
                  "Sub County": subCountyLayer,
                  Constituency: constituencyLayer,
                  Counties: countiesLayer,
                };

                // Add tile layers control
                let layersControl = L.control
                  .layers(baseLayers, geoJsonLayers, { collapsed: false })
                  .addTo(map)
                  .setPosition("topright"); // or other appropriate position

                // Initialize map view
                var bounds = countiesLayer.getBounds();
                map.fitBounds(bounds);

                // Adding the legend 
                let legend = "";
                legend += `<h4>Legend</h4>
                  <p>Counties: <span class='legend-symbol' style='background-color: lightblue;'></span></p>
                  <p>Constituency: <span class='legend-symbol' style='background-color: orange;'></span></p>
                  <p>Sub County: <span class="legend-symbol" style="background-color: none; border: 2px solid black;"></span></p>
                  <p>Health Centers: <span class='legend-symbol' style='background-color: red;'></span></p>`;
                document.getElementById("legendPanel").innerHTML = legend;

                // label control to panel
                let labels = "";
                labels += `<h4>Labels</h4>
                <p><strong>Sub County</strong></p>
                <input type="checkbox" id="subCountyLabel"> Show Labels
                <p><strong>Health Centers</strong></p>
                <input type="checkbox" id="healthCentersLabel" > Show Labels`;
                document.getElementById("labelsPanel").innerHTML = labels;
                // Show/hide labels for sub-counties
                document
                  .getElementById("subCountyLabel")
                  .addEventListener("change", function () {
                    if (this.checked) {
                      subCountyLayer.eachLayer(function (layer) {
                        layer
                          .bindTooltip(layer.feature.properties.NAME_3, {
                            permanent: true,
                            className: "label-sub-county",
                            direction: "center",
                          })
                          .openTooltip();
                      });
                    } else {
                      subCountyLayer.eachLayer(function (layer) {
                        layer.unbindTooltip();
                      });
                    }
                  });
                // Show/hide labels for health centers
                document
                  .getElementById("healthCentersLabel")
                  .addEventListener("change", function () {
                    if (this.checked) {
                      healthCentersLayer.eachLayer(function (layer) {
                        layer
                          .bindTooltip(layer.feature.properties.Facility_N, {
                            permanent: true,
                            className: "label-health-center",
                            direction: "right",
                            backgroundColor: "transparent",
                          })
                          .openTooltip();
                      });
                    } else {
                      healthCentersLayer.eachLayer(function (layer) {
                        layer.unbindTooltip();
                      });
                    }
                  });
                
                

// Show/hide popups for health centers on mouseover
document.getElementById("healthCentersLabel").addEventListener("change", function () {
  healthCentersLayer.eachLayer(function (layer) {
    // Create a popup content
    var popupContent = `
      <strong>${layer.feature.properties.Facility_N}</strong><br>
      Type: ${layer.feature.properties.Type}<br>
      Capacity: ${layer.feature.properties.Capacity}
    `;

    // Bind the popup to the layer on mouseover
    layer.on('mouseover', function () {
      layer.bindPopup(popupContent, {
        closeButton: false, // Optionally, you can disable the close button
      }).openPopup();
    });

    // Unbind the popup on mouseout
    layer.on('mouseout', function () {
      layer.unbindPopup();
    });
  });
});

// Adding  filters to panel
let filters = "";
filters += `<h4>Filters</h4>
<p><strong>Sub County</strong></p>
<select id="subCountyFilter"></select>
<p><strong>Health Centers</strong></p>
<select id="healthCentersFilter"></select>`;
document.getElementById("filtersPanel").innerHTML = filters;

// Populate subCountyData
subCountyData.features.forEach((feature) => {
  document.getElementById(
    "subCountyFilter"
  ).innerHTML += `<option value="${feature.properties.NAME_3}">${feature.properties.NAME_3}</option>`;
});



// Filter sub-counties based on selection
document
  .getElementById("subCountyFilter")
  .addEventListener("change", function () {
    let selectedSubCounty = this.value;
    subCountyLayer.eachLayer(function (layer) {
      if (layer.feature.properties.NAME_3 === selectedSubCounty) {
        layer.setStyle({ fillColor: "yellow" });
      } else {
        layer.setStyle({
          fillColor: "none",
          color: "black",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7,
        });
      }
    });
  });

  
// Populate healthCentersData
healthCentersData.features.forEach((feature) => {
  document.getElementById("healthCentersFilter").innerHTML += `<option value="${feature.properties.Owner}">${feature.properties.Owner}</option>`;
});

// Populate the health centers dropdown
var healthCentersDropdown = document.getElementById("healthCentersFilter");

// array to keep track of unique health center names
var uniqueHealthCenters = [];


var healthCentersDropdown = document.getElementById("healthCentersFilter");
// no selection option
var noSelectedItemOption = document.createElement("option");
noSelectedItemOption.value = ""; // You can set this value to an appropriate default value
noSelectedItemOption.textContent = "No Selection";
healthCentersDropdown.insertBefore(noSelectedItemOption, healthCentersDropdown.firstChild);

// Iterate through health center features
healthCentersData.features.forEach(function (feature) {
  var healthCenterName = feature.properties.Facility_N;

  // Check if the health center name is not in the unique array
  if (!uniqueHealthCenters.includes(healthCenterName)) {
    // Add the name to the unique array
    uniqueHealthCenters.push(healthCenterName);

    // Create an option element and append it to the dropdown
    var option = document.createElement("option");
    option.value = healthCenterName;
    option.textContent = healthCenterName;
    healthCentersDropdown.appendChild(option);
  }
});

// Event listener for dropdown change.
document.getElementById("healthCentersFilter").addEventListener("change", function () {
  var selectedHealthCenter = this.value;
  console.log(selectedHealthCenter);
  healthCentersLayer.eachLayer(function (layer) {
    if (selectedHealthCenter === "" || layer.feature.properties.Facility_N === selectedHealthCenter) {
      layer.setStyle({ fillColor: "blue" });
    } else {
      layer.setStyle({
        fillColor: "red",
        color: "red",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
      });
    }
  });
});

})
.catch((error) =>
  console.error("Error loading health centers GeoJSON data:", error)
);
})
.catch((error) =>
console.error("Error loading sub-county GeoJSON data:", error)
);
})
.catch((error) =>
console.error("Error loading constituency GeoJSON data:", error)
);
})
.catch((error) =>
console.error("Error loading county GeoJSON data:", error)
);
