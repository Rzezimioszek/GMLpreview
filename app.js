
    // Podkłady mapowe
    const baseLayers = {
        "OpenStreetMap": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
          maxZoom:25
        }),
        "Ciemny": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: "© CartoDB",
            subdomains: "abcd",
            maxZoom:25
          }),
        "Ortofotomapa-Geoportal": L.tileLayer.wms("https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution", {
          layers: "Raster",
          format: "image/png",
          transparent: true,
          attribution: "© Geoportal",
          version: "1.3.0",
          maxZoom:25
        }),
        "Ortofotomapa-Geoportal-HighRes": L.tileLayer.wms("https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution", {
            layers: "Raster",
            format: "image/png",
            transparent: true,
            attribution: "© Geoportal",
            version: "1.3.0",
            maxZoom:25
          }),
        "Brak": L.tileLayer("", {
            attribution: "",
            subdomains: "abcd",
            maxZoom:25
          })
      };

      const overlayers = {
        "KIEG": L.tileLayer.wms("https://integracja02.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow", {
            layers: "dzialki,numery_dzialek,budynki",
            format: "image/png",
            transparent: true,
            attribution: "© Geoportal",
            version: "1.3.0",
            maxZoom:25
          }),
          "KIUT": L.tileLayer.wms("https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaUzbrojeniaTerenu", {
            layers: "przewod_urzadzenia,przewod_niezidentyfikowany,przewod_specjalny,przewod_telekomunikacyjny,przewod_cieplowniczy,przewod_gazowy,przewod_elektroenergetyczny,przewod_kanalizacyjny,przewod_wodociagowy",
            format: 'image/png',
            transparent: true,
            attribution: "© Geoportal",
            maxZoom:25
          }),
        "KIBDOT": L.tileLayer.wms("https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaBazDanychObiektowTopograficznych", {
            layers: "bdot",
            format: 'image/png',
            transparent: true,
            attribution: "© Geoportal",
            maxZoom:25
        })
      }
      
    const map = L.map('map').setView([52, 19], 7);
    const layerGroups = {};
    const innerLayers = {};
    const featuresByClass = {};

    const epsgDefs = {
      'EPSG:2176': '+proj=tmerc +lat_0=0 +lon_0=15 +k=0.999923 +x_0=5500000 +y_0=0 +ellps=GRS80 +units=m +no_defs',
      'EPSG:2177': '+proj=tmerc +lat_0=0 +lon_0=18 +k=0.999923 +x_0=6500000 +y_0=0 +ellps=GRS80 +units=m +no_defs',
      'EPSG:2178': '+proj=tmerc +lat_0=0 +lon_0=21 +k=0.999923 +x_0=7500000 +y_0=0 +ellps=GRS80 +units=m +no_defs',
      'EPSG:2179': '+proj=tmerc +lat_0=0 +lon_0=24 +k=0.999923 +x_0=8500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
    };

    // Dodaj domyślny podkład do mapy
    baseLayers["OpenStreetMap"].addTo(map);
    L.control.layers(baseLayers, overlayers, { position: 'topright', collapsed: true }).addTo(map);

    const defaultStyle = {
        color: "#3388ff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.2
      };
      
    const highlightStyle = {
        color: "#ffcc00",
        fillColor: "#ffcc00",
        weight: 4,
        opacity: 1,
        fillOpacity: 0.5
      };

    Object.entries(epsgDefs).forEach(([code, def]) => proj4.defs(code, def));

    document.getElementById('fileInput').addEventListener('change', handleFile);

    function switchTab(id, title) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.getElementById(`tab-${id}`).classList.add('active');
      document.getElementById(`tab-active`).textContent = title;
    }

    function handleFile(evt) {
      const file = evt.target.files[0];
      const reader = new FileReader();
      switchTab('load');
      reader.onload = function(e) {
        const xml = new DOMParser().parseFromString(e.target.result, 'application/xml');
        parseGML(xml);
      };
      reader.readAsText(file);
    }

    function transformCoords(x, y, srsName) {
      const code = `EPSG:${srsName.split('EPSG::')[1]}`;
      return proj4.defs(code) ? proj4(code, 'EPSG:4326', [y, x]) : [x, y];
    }

    // Style
    function styleFeature(feature) {

        //console.log('klasaObiektu:', feature.properties.klasaObiektu);

        switch (feature.properties.klasaObiektu) {
            case 'EGB_JednostkaEwidencyjna':
                return {
                  color: '#000000',  // czarny obrys
                  weight: 1,
                  opacity: 1,
                  fillColor: '#FFFFFF',
                  fillOpacity: 0.01,
                  dashArray: '6, 2',
                  dashOffset: '0'
                };
            case 'EGB_ObrebEwidencyjny':
                    return {
                      color: '#000000', 
                      weight: 1,
                      opacity: 1,
                      fillColor: '#FFFFFF',
                      fillOpacity: 0.01,
                      dashArray: '6, 4',
                      dashOffset: '0'
                    };
          case 'EGB_DzialkaEwidencyjna':
            return {
              color: '#000000',  
              weight: 1,
              opacity: 1,
              fillColor: '#FFFFFF',
              fillOpacity: 0.01,
            };
          case 'EGB_KonturUzytkuGruntowego':
            return {
              color: '#000000',  
              weight: 1,
              fillColor: '#FFFFFF',  
              fillOpacity: 0.01,
              dashArray: '2, 2',
              dashOffset: '0'
            };
        case 'EGB_KonturKlasyfikacyjny':
                return {
                  color: '#000000',  
                  weight: 1,
                  fillColor: '#FFFFFF',  
                  fillOpacity: 0.01,
                  dashArray: '6, 2',
                dashOffset: '0'
                };
        case 'EGB_ArkuszEwidencyjny':
                return {
                  color: '#000000',  
                  weight: 1,
                  fillColor: '#FFFFFF',  
                  fillOpacity: 0.01,
                  dashArray: '6, 2',
                dashOffset: '0'
                };
          case 'EGB_Budynek':
            return {
              color: '#000000',  
              weight: 2,
              fillColor: '#FFFFFF', 
              fillOpacity: 0.01
            };
          case 'EGB_PunktGraniczny':
            return {
              color: '#000000',
              radius: 4,
              fillColor: '#000000',
              fillOpacity: 1,
              weight: 1
            };
          case 'EGB_OsnowaEwidencyjna':
            return {
              color: '#0000FF',  // niebieski
              radius: 5,
              fillColor: '#87CEFA',
              fillOpacity: 0.8,
              weight: 1
            };
        case 'KR_ObiektKarto':
                return {
                  color: '#cf382c',  // ciemny czerwony
                  radius: 5,
                  fillColor: '#000000',
                  fillOpacity: 0.8,
                  weight: 1
            };
            // GESUT
        case 'GES_PrzewodWodociagowy':
                return {
                  color: '#0000ff',  
                  radius: 5,
                  fillColor: '#0000ff',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_UrzadzeniaSiecWodociagowa':
                return {
                  color: '#0000ff', 
                  radius: 5,
                  fillColor: '#0000ff',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_PrzewodGazowy':
                return {
                  color: '#bfbf00', 
                  radius: 5,
                  fillColor: '#bfbf00',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_UrzadzeniaSiecGazowa':
                return {
                  color: '#bfbf00', 
                  radius: 5,
                  fillColor: '#bfbf00',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_PrzewodKanalizacyjny':
                return {
                  color: '#803300', 
                  radius: 5,
                  fillColor: '#803300',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_UrzadzeniaSiecKanalizacyjna':
                return {
                  color: '#803300', 
                  radius: 5,
                  fillColor: '#803300',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_PrzewodElektroenergetyczny':
                return {
                  color: '#ff0000', 
                  radius: 5,
                  fillColor: '#ff0000',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_UrzadzeniaSiecElektroenergetyczna':
                return {
                  color: '#ff0000', 
                  radius: 5,
                  fillColor: '#ff0000',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_PrzewodCieplowniczy':
                return {
                  color: '#d200d2', 
                  radius: 5,
                  fillColor: '#d200d2',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_UrzadzeniaSiecCieplownicza':
                return {
                  color: '#d200d2', 
                  radius: 5,
                  fillColor: '#d200d2',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_PrzewodTelekomunikacyjny':
                return {
                  color: '#d200d2', 
                  radius: 5,
                  fillColor: '#d200d2',
                  fillOpacity: 0.8,
                  weight: 1
            };
        case 'GES_UrzadzeniaSiecTelekomunikacyjna':
                return {
                  color: '#d200d2', 
                  radius: 5,
                  fillColor: '#d200d2',
                  fillOpacity: 0.8,
                  weight: 1
            };
          default:
            return {
              color: '#cf382c',
              weight: 1,
              fillOpacity: 0.3
            };
        }
      }
      
    function getPolygonCentroid(coords) {
        let x = 0, y = 0, area = 0;
      
        for (let i = 0, len = coords.length, j = len - 1; i < len; j = i++) {
          const xi = coords[i][0], yi = coords[i][1];
          const xj = coords[j][0], yj = coords[j][1];
          const a = xi * yj - xj * yi;
          area += a;
          x += (xi + xj) * a;
          y += (yi + yj) * a;
        }
      
        area *= 0.5;
        const factor = 1 / (6 * area);
        return [x * factor, y * factor];
      }

    function getPropertiesRecursive(element) {
        const properties = {};
        Array.from(element.children).forEach(child => {
          if (child.children.length === 0) {
            properties[child.localName] = child.textContent.trim();
          } else {
            // Rekursywnie pobieraj zagnieżdżone atrybuty
            const nested = getPropertiesRecursive(child);
            
            Object.assign(properties, nested);
          }
        });
        return properties;
      }

    function createTextLabel(feature, latlng) {
        try {
        const text = feature.properties.tekst ||'-';
        const rotation = feature.properties.katObrotu || 0;

        //console.log(feature.properties,"::", text, latlng, rotation);
      
        const icon = L.divIcon({
          className: 'rotated-label',
          html: `<div style="transform: rotate(${rotation}deg);color: #000000; transform-origin: left; white-space: nowrap;">${text}</div>`,
          iconSize: null // rozmiar dopasowuje się do treści
        });
      
        return L.marker(latlng, { icon: icon, interactive: false });
        } catch (err){
            console.warn("Błąd dodawania etykiety:", err, latlng);
        }
      }
      
    // Wczytywanie danych GML 
    function parseGML(xml) {
      const members = xml.getElementsByTagNameNS('*', 'featureMember');

      Array.from(members).forEach(member => {
        try {
        const feature = member.firstElementChild;
        let cls = feature.localName;
        const geom = feature.querySelector('Point, LineString, Polygon, Curve');
        let geometry = null;
        //if (!geom) return;
        if (!geom) {
            geometry =  {type: "Else", coordinates: [0.0, 0.0] };
            cls = feature.localName + " (bez geometrii)";

        } else {

        const srsName = geom.getAttribute('srsName') || '';
        

        if (geom.localName === 'Point') {
          const coords = geom.querySelector('pos').textContent.split(' ').map(Number);
          const [x, y] = transformCoords(coords[0], coords[1], srsName);
          geometry = { type: 'Point', coordinates: [x, y] };
        } else if (geom.localName === 'LineString') {
          const coords = geom.querySelector('posList').textContent.trim().split(/\s+/).map(Number);
          const coordinates = [];
          for (let i = 0; i < coords.length; i += 2) {
            coordinates.push(transformCoords(coords[i], coords[i + 1], srsName));
          }
          geometry = { type: 'LineString', coordinates };
        } else if (geom.localName === 'Polygon') {
          const posList = geom.querySelector('posList').textContent.trim().split(/\s+/).map(Number);
          const coordinates = [];
          for (let i = 0; i < posList.length; i += 2) {
            coordinates.push(transformCoords(posList[i], posList[i + 1], srsName));
          }
          geometry = { type: 'Polygon', coordinates: [coordinates] };
        }  else if (geom.localName === 'Curve') {
            const posListNode = geom.querySelector('posList');
            if (posListNode) {
              const coords = posListNode.textContent.trim().split(/\s+/).map(Number);
              const coordinates = [];
              for (let i = 0; i < coords.length; i += 2) {
                coordinates.push(transformCoords(coords[i], coords[i + 1], srsName));
              }
              geometry = { type: 'LineString', coordinates };
            }
        }
        }

        const properties = Object.assign({ klasaObiektu: cls }, getPropertiesRecursive(feature)); 
        Array.from(feature.children).forEach(el => {
            const propName = el.localName;
            const href = el.getAttribute('xlink:href');
            const value = href ? { 'xlink:href': href } : (!el.children.length ? el.textContent : null);
          
            if (value !== null) {
                if (properties[propName]) {
                  if (!Array.isArray(properties[propName])) {
                    properties[propName] = [properties[propName]];
                  }
                  // Dodaj tylko, jeśli nie istnieje już taka sama wartość
                  const isDuplicate = properties[propName].some(existing =>
                    typeof existing === 'object' && typeof value === 'object'
                      ? existing['xlink:href'] === value['xlink:href']
                      : existing === value
                  );
                  if (!isDuplicate) {
                    properties[propName].push(value);
                  }
                } else {
                  properties[propName] = value;
                }
              }
              
          });
          
          

        if (!featuresByClass[cls]) featuresByClass[cls] = [];

        featuresByClass[cls].push({ type: 'Feature', geometry, properties });

      } catch(err){
        console.warn("Błąd przetwarzania featureMember:", err);
      }
    });

    

      Object.entries(featuresByClass).forEach(([cls, features]) => {
        try {
        const layer = L.geoJSON({ type: 'FeatureCollection', features }, {
            style: styleFeature,
            pointToLayer: (feature, latlng) => {
                if (cls === 'KR_ObiektKarto' || cls === 'PrezentacjaGraficzna'){
                    try {
                        
                        const myMarker = createTextLabel(feature, latlng);
                        return myMarker
                      }
                      catch(err) {
                      }
                    
                } else {
                    return L.circleMarker(latlng, {
                        radius: 0.1,
                        color: '#000000',
                        fillColor: '#000000',
                        fillOpacity: 1,
                        weight: 0.1
                      })
                }
                },
            onEachFeature: (feature, layer) => {
              layer.on('click', () => showFeatureInfo(feature.properties));
              onEachFeature(feature, layer);
            }
          }).addTo(map);
          

        layerGroups[cls] = layer;
        addLayerControl(cls, layer);
    } catch(err)
    {
        console.warn(`Błąd tworzenia warstwy ${cls}:`, err);
    }
    finally {
        
    }

    try {
        

        if (cls === 'KR_ObiektKarto' || cls === 'PrezentacjaGraficzna')// || cls === 'GES_Rzedna')
        {

          features.forEach(feature => {
            //console.log(feature.properties);
            const coords = feature.properties.pos.split(' ').map(Number);
            //console.log('coords', coords, srsName);
            
            let epsg = '2178';

                switch(String(coords[1]).charAt(0)) {
                    case '6':
                      epsg = '2177';
                      break;
                    case '5':
                      epsg = '2176';
                      break;
                    case '8':
                      epsg = '2179';
                      break;
                    default:
                      epsg = '2178';
                  } 
            //console.log(String(coords[1]).charAt(0));

            const [x, y] = transformCoords(coords[0], coords[1], `EPSG::${epsg}`);
            //console.log('x, y',x, y);

              const myMarker2 = createTextLabel(feature, [y, x]);
              //console.log('marker load: ', feature.properties.kodObiektu)
              const kodObiektu = feature.properties.kodObiektu[0] || 'none'

              if (!innerLayers[kodObiektu]) {
                  innerLayers[kodObiektu] = L.layerGroup();
                  //warstwaKR_ObiektKarto.addLayer(podwarstwyKR[kodObiektu]);
              }
              innerLayers[kodObiektu].addLayer(myMarker2);   
              console.log(`KOD: ${kodObiektu}`);      
      
          }
          );
      }
    } catch {}

      });

      //switchTab('table');
      switchTab('layers', 'Warstwy');
      buildDataTable();
    }

    // Podgląd atrybutów
    function showFeatureInfo(properties) {
        const info = document.getElementById('tab-info');
        let html = '<strong>Dane obiektu:</strong><br>';
      
        for (const [key, value] of Object.entries(properties)) {
            if (Array.isArray(value)) {
              html += `<strong>${key}</strong>:<ul>`;
              value.forEach(item => {
                if (typeof item === 'object' && item['xlink:href']) {
                  html += `<li><a href="${item['xlink:href']}" target="_blank" style="text-decoration: underline; color: blue;">${item['xlink:href']}</a></li>`;
                } else {
                  html += `<li>${item}</li>`;
                }
              });
              html += '</ul>';
            } else if (typeof value === 'object' && value !== null && value['xlink:href']) {
              html += `<strong>${key}</strong>: <a href="${value['xlink:href']}" target="_blank" style="text-decoration: underline; color: blue;">${value['xlink:href']}</a><br>`;
            } else {
              html += `<strong>${key}</strong>: ${value}<br>`;
            }
          }
        info.innerHTML = html;

        switchTab('info', 'Atrybuty obiektu');
      }
    
    // Formatowanie wartości w tabeli
    function formatPropertyValue(value) {
        if (value && typeof value === 'object' && value['xlink:href']) {
          return `<a href="${value['xlink:href']}" target="_blank" style="text-decoration:underline">${value['xlink:href']}</a>`;
        }
        return value ?? '';
      }
      
    // Pop up z tabelą
    // TODO do dodania zapis do xls, json itp.
    function openTablePopup(cls, features) {
        const popup = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        if (!popup) {
          alert("Popup został zablokowany przez przeglądarkę.");
          return;
        }
      
        const keys = Object.keys(features[0].properties);
        let html = `
          <html>
            <head>
              <title>${cls}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 10px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ccc; padding: 1px; text-align: left; vertical-align: top; }
                th { background-color: #f4f4f4; }
              </style>
            </head>
            <body>
              <h2>${cls}</h2>
              <table>
                <thead><tr>${keys.map(k => `<th>${k}</th>`).join('')}</tr></thead>
                <tbody>
        `;
      
        features.forEach(f => {
            html += '<tr>' + keys.map(k => {
                let value = f.properties[k];
                if (Array.isArray(value)) {
                  value = [...new Set(value.map(v => formatPropertyValue(v)))].join(', ');
                } else {
                  value = formatPropertyValue(value);
                }
                return `<td>${value}</td>`;
              }).join('') + '</tr>';
              
        });
      
        html += `
                </tbody>
              </table>
            </body>
          </html>
        `;
      
        popup.document.write(html);
        popup.document.close();
      }

    function buildDataTable() {
        const tableDiv = document.getElementById('tab-table');
        tableDiv.innerHTML = '<h3>Warstwy z atrybutami:</h3>';
      
        Object.entries(featuresByClass).forEach(([cls, features]) => {
          if (features.length === 0) return;
          const button = document.createElement('button');
          button.textContent = cls;
          button.style.margin = '4px';
          button.style.padding = '10px';
          button.addEventListener('click', () => openTablePopup(cls, features));
          tableDiv.appendChild(button);
          tableDiv.appendChild(document.createElement('br'));
        });
      }

    function zoomToData() {
        const bounds = L.latLngBounds();
        let hasData = false;
      
        Object.entries(layerGroups).forEach(([name, group]) => {
          if (group && group.getLayers) {
            const layers = group.getLayers();
            layers.forEach(l => {
              if (l.getBounds && l.getBounds().isValid()) {
                bounds.extend(l.getBounds());
                hasData = true;
              } else if (l.getLatLng) {
                bounds.extend(l.getLatLng());
                hasData = true;
              }
            });
          }
        });
      
        if (hasData && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        } else {
          console.warn("Brak danych – bounds:", bounds);
          alert("Brak danych do wyświetlenia.");
        }
      }
      
    function addLayerControl(name, layer) {
      const container = document.getElementById('tab-layers');
      const id = `layer-${name}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = id;
      checkbox.checked = false; // Ustawiama domyśnie nie wczytane warstwy
      map.removeLayer(layer);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          map.addLayer(layer);
        } else {
          map.removeLayer(layer);
        }
      });
      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = name;
      container.appendChild(checkbox);
      container.appendChild(label);
      container.appendChild(document.createElement('br'));
    }

    function clearExistingData() {
        // Remove existing layers
        Object.values(layerGroups).forEach(layer => {
          map.removeLayer(layer);
        });
        
        // Clear data structures
        Object.keys(layerGroups).forEach(key => delete layerGroups[key]);
        Object.keys(featuresByClass).forEach(key => delete featuresByClass[key]);
        
        // Clear UI
        document.getElementById('tab-layers').innerHTML = '';
        document.getElementById('tab-table').innerHTML = '';
      }

      function onEachFeature(feature, layer) {
        layer.on({
          mouseover: (e) => {
            e.target.setStyle(highlightStyle);
            e.target.bringToFront(); // opcjonalnie: na wierzch
          },
          mouseout: (e) => {
            e.target.setStyle(styleFeature(feature));
            //layer.resetStyle(e.target);
            //e.target.resetStyle() // przywróć styl domyślny
          }
        });
      }

const minZoomViz = 16;

function updateLabelVisibility(kod, layerName){
    try{
        if (((map.getZoom() >= minZoomViz)) && map.hasLayer( layerGroups[layerName])){
            if (!map.hasLayer(innerLayers[kod])) {
            map.addLayer(innerLayers[kod])
         }
        } else {
            map.removeLayer(innerLayers[kod]); 
        }  
        } catch {}

}

// Funkcja kontrolująca widoczność
function updateObiektKartoVisibility() {

    const warstwy = {
        // EGIB
        'EGDE': 'EGB_DzialkaEwidencyjna',
        'EGBU': 'EGB_Budynek',
        'EGUG': 'EGB_KonturUzytkuGruntowego',
        'EGKK': 'EGB_KonturKlasyfikacyjny',
        'EGBN': 'EGB_BlokBudynku',
        'EGBP': 'EGB_BlokBudynku',
        'EGBL': 'EGB_BlokBudynku',
        'EGBA': 'EGB_BlokBudynku',
        'EGOE': 'EGB_ObrebEwidencyjny',
        'EGJE': 'EGB_JednostkaEwidencyjna',
        'EGPG': 'EGB_PunktGraniczny',

        // GESUT
        'SUWP': 'GES_PrzewodWodociagowy',
        //
        "SUCG": "GES_PrzewodCieplowniczy",
        "SUEE": "GES_PrzewodEnergetyczny",
        "SUGG": "GES_PrzewodGazowy",
        "SUKK": "GES_KanalizacjaKablowka",
        "SUKW": "GES_PrzewodKanalizacyjny",
        "SUTT": "GES_PrzewodTelekomunikacyjny",
        "SUSD": "GES_Slup",
        "SUSZ": "GES_SkrzynkaRozdzielcza",
        "SUKA": "GES_Kamera",
        "SUPP": "GES_PunktPomiarowy",

        // BDOT500 - obiekty powierzchniowe
        "BUBD": "BDT_Budynek",
        "BUIN": "BDT_InnyObiektBudowlany",
        "KUKR": "BDT_KorytoRzeki",
        "KUSP": "BDT_SztucznyZbiornikWodny",
        "KUTP": "BDT_TerenZieleni",
        "KUSN": "BDT_Sad",
        "KULS": "BDT_Las",
        "DRKD": "BDT_Droga",
        "DRWP": "BDT_WiaduktLubMost",
        "DRCH": "BDT_ChodnikLubSciezka",
        "DRPO": "BDT_Parking",
        "DRPT": "BDT_PeronTramwajowy",
        "DRKO": "BDT_Kolej",

        // BDOT500 - obiekty punktowe
        "PTBR": "BDT_Bramka",
        "PTPR": "BDT_PrzejscieDlaPieszych",
        "PTSL": "BDT_Sygnalizator",
        "PTLI": "BDT_LiniaEnergetyczna",
        "PTLA": "BDT_Latarnia",
        "PTDR": "BDT_Drzewo",

        // BDOT500 - obiekty liniowe
        "LNOG": "BDT_Ogrozenie",
        "LNKL": "BDT_Kolej",
        "LNSC": "BDT_Sciezka",
        "LNCH": "BDT_Chodnik",
        "LNSM": "BDT_Schody",
        "LNKR": "BDT_Krawężnik"

        // TODO: Dodaj kolejne kody i klasy obiektów
    };

    for (const kod in warstwy) {
        updateLabelVisibility(kod, warstwy[kod]);
    }

}

// Wywołaj przy starcie i przy każdej zmianie zoomu
map.on('zoomend', updateObiektKartoVisibility);
//updateObiektKartoVisibility();
