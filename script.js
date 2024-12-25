const root = document.documentElement;
const marqueeElementsDisplayed = getComputedStyle(root).getPropertyValue("--marquee-elements-displayed");
const marqueeContent = document.querySelector("ul.marquee-content");

root.style.setProperty("--marquee-elements", marqueeContent.children.length);

for(let i=0; i<marqueeElementsDisplayed; i++) {
  marqueeContent.appendChild(marqueeContent.children[i].cloneNode(true));
}


document.addEventListener('DOMContentLoaded', () => {
    const map = document.querySelector('#us-map');
    const selectedState = document.querySelector('#selected-state');
    const broadbandInfo = document.querySelector('#broadband-info');
    const searchForm = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');

    let broadbandData = [];

    // Load CSV file
    fetch('broadband_data.csv')
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split('\n').slice(1); // Remove the header row
            broadbandData = rows.map(row => {
                const [
                    zip, population, county, state, wiredCount_2020, fwcount_2020,
                    allProviderCount_2020, wired25_3_2020, wired100_3_2020, all25_3_2020,
                    all100_3, testCount, averageMbps, fastestAverageMbps, 
                    accessToTerrestrialBroadband, lowestPricedTerrestrialBroadbandPlan,
                    wiredCount_2015, fwcount_2015, allProviderCount_2015, wired25_3_2015,
                    wired100_3_2015, all25_3_2015
                ] = row.split(',');

                return {
                    zip: zip.trim(),
                    population,
                    county,
                    state,
                    wiredCount_2020,
                    fwcount_2020,
                    allProviderCount_2020,
                    wired25_3_2020,
                    wired100_3_2020,
                    all25_3_2020,
                    all100_3,
                    testCount,
                    averageMbps,
                    fastestAverageMbps,
                    accessToTerrestrialBroadband,
                    lowestPricedTerrestrialBroadbandPlan, // Trim whitespace
                    wiredCount_2015,
                    fwcount_2015,
                    allProviderCount_2015,
                    wired25_3_2015,
                    wired100_3_2015,
                    all25_3_2015,
                    all100_3
                };
            });

            // Click event for each state
            map.querySelectorAll('path').forEach((statePath) => {
                statePath.addEventListener('click', () => {
                    const stateName = statePath.getAttribute('data-name');
                    selectedState.textContent = stateName;
                    displayBroadbandInfoForState(stateName, broadbandData);
                });
            });
        })
        .catch(error => console.error('Error loading CSV:', error));

    // Handle ZIP search
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const zipCode = searchInput.value.trim();
        displayBroadbandInfoForZip(zipCode, broadbandData);
    });
});

function displayBroadbandInfoForState(stateName, broadbandData) {
    const broadbandInfo = document.querySelector('#broadband-info');

    if (!broadbandInfo) {
        console.error('Error: Could not find the #broadband-info element in the DOM.');
        return;
    }

    const stateData = broadbandData
        .filter(entry => entry.state === stateName && entry.lowestPricedTerrestrialBroadbandPlan !== '' && !isNaN(entry.lowestPricedTerrestrialBroadbandPlan));

    if (stateData.length === 0) {
        broadbandInfo.innerHTML = `
            <h3>Broadband Data for ${stateName}</h3>
            <p>No broadband data available.</p>
        `;
        return;
    }

    const top5 = stateData
        .sort((a, b) => parseFloat(a.lowestPricedTerrestrialBroadbandPlan) - parseFloat(b.lowestPricedTerrestrialBroadbandPlan))
        .slice(0, 5);

    broadbandInfo.innerHTML = generateTable('Broadband Data for ' + stateName, top5);
}

function displayBroadbandInfoForZip(zipCode, broadbandData) {
    const broadbandInfo = document.querySelector('#broadband-info');

    if (!broadbandInfo) {
        console.error('Error: Could not find the #broadband-info element in the DOM.');
        return;
    }

    const zipData = broadbandData
        .filter(entry => entry.zip === zipCode && entry.lowestPricedTerrestrialBroadbandPlan !== '' && !isNaN(entry.lowestPricedTerrestrialBroadbandPlan));

    if (zipData.length === 0) {
        broadbandInfo.innerHTML = `
            <h3>Broadband Data for ZIP: ${zipCode}</h3>
            <p>No broadband data available for this ZIP code.</p>
        `;
        return;
    }

    const top5 = zipData
        .sort((a, b) => parseFloat(a.lowestPricedTerrestrialBroadbandPlan) - parseFloat(b.lowestPricedTerrestrialBroadbandPlan))
        .slice(0, 5);

    broadbandInfo.innerHTML = generateTable('Broadband Data for ZIP: ' + zipCode, top5);
}

function generateTable(title, data) {
    const tableHeader = `
        <tr>
            <th>Rank</th>
            <th>County</th>
            <th>ZIP</th>
            <th>Population</th>
            <th>Lowest Priced Plan ($)</th>
            <th>Fastest Average Mbps</th>
            <th>Access to Broadband</th>
        </tr>
    `;

    const tableRows = data.map((entry, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${entry.county}</td>
            <td>${entry.zip}</td>
            <td>${entry.population}</td>
            <td>$${entry.lowestPricedTerrestrialBroadbandPlan}</td>
            <td>${entry.fastestAverageMbps}</td>
            <td>${entry.accessToTerrestrialBroadband}</td>
        </tr>
    `).join('');

    return `
        <h3>${title}</h3>
        <table>
            ${tableHeader}
            ${tableRows}
        </table>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
  
    const searchButton = document.getElementById('search-button');
    const zipCodeInput = document.getElementById('zip-code-input');
    const broadbandInfo = document.getElementById('broadband-info');
    console.log("inside");
    
    let broadbandData = [];
    
    fetch('broadband_data.csv')
      .then(response => {
        console.log("CSV fetched");
        return response.text();
      })
      .then(csvText => {
        console.log("CSV content loaded:", csvText);
        const rows = csvText.split('\n').slice(1);
        broadbandData = rows.map(row => {
          const [
            zip, population, county, state, wiredCount, ,
            , , , , , , avgMbps, ,
            , lowestPrice
          ] = row.split(',');
  
          return {
            zip: zip.trim(),
            population: population.trim(),
            county: county.trim(),
            state: state.trim(),
            wiredCount: wiredCount.trim(),
            avgMbps: avgMbps.trim(),
            lowestPrice: lowestPrice.trim()
          };
        });
        console.log("Parsed broadband data:", broadbandData);
      })
      .catch(error => console.error('Error loading CSV:', error));
    
    searchButton.addEventListener('click', () => {
      console.log("Search button clicked");
      const zipCode = zipCodeInput.value.trim();
      console.log("Searching for ZIP:", zipCode);
      displayBroadbandInfo(zipCode, broadbandData);
    });
    
    function displayBroadbandInfo(zipCode, data) {
      console.log("Displaying info for ZIP:", zipCode);
      const zipData = data.filter(entry => entry.zip === zipCode);
      console.log("Filtered data:", zipData);
  
      if (zipData.length === 0) {
        broadbandInfo.innerHTML = `<p>No broadband data available for ZIP code: ${zipCode}</p>`;
        return;
      }
  
      const tableHeader = `
        <table>
          <thead>
            <tr>
              <th>ZIP Code</th>
              <th>Population</th>
              <th>County</th>
              <th>State</th>
              <th>Wired Count</th>
              <th>Average Mbps</th>
              <th>Lowest Priced Plan</th>
            </tr>
          </thead>
          <tbody>
      `;
  
      const tableRows = zipData.map(entry => `
        <tr>
          <td>${entry.zip}</td>
          <td>${entry.population}</td>
          <td>${entry.county}</td>
          <td>${entry.state}</td>
          <td>${entry.wiredCount}</td>
          <td>${entry.avgMbps}</td>
          <td>$${entry.lowestPrice}</td>
        </tr>
      `).join('');
  
      const tableFooter = '</tbody></table>';
  
      broadbandInfo.innerHTML = tableHeader + tableRows + tableFooter;
    }
  });
  function redirectToCompareProviders(event) {
    event.preventDefault(); // Prevent default form submission
    const zipCodeInput = document.getElementById("main-zip-code").value.trim();
    if (zipCodeInput) {
        // Redirect to the compareProviders page with the ZIP code as a query parameter
        window.location.href = `compareProviders.html?zip=${zipCodeInput}`;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // List of pages with their display names and URLs
    const pages = [
        { name: "Compare Providers", url: "compareProviders.html" },
        { name: "Review Providers", url: "reviewProviders.html" },
        { name: "Resources", url: "resources.html" },
        { name: "Internet Speed Test", url: "speed.html" },
        { name: "Troubleshooting", url: "troubleshooting.html" },
        { name: "Annual Review", url: "readmore.html" },
        { name: "Contact Us", url: "contact.html" },
        { name: "About", url: "about.html" }
    ];

    // Event listener for search input
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        searchResults.innerHTML = ""; // Clear previous results

        if (query) {
            // Filter pages based on input
            const filteredPages = pages.filter(page =>
                page.name.toLowerCase().includes(query)
            );

            // Show results
            filteredPages.forEach(page => {
                const listItem = document.createElement('li');
                listItem.textContent = page.name;
                listItem.classList.add('search-result-item');
                listItem.addEventListener('click', () => {
                    window.location.href = page.url; // Redirect to selected page
                });
                searchResults.appendChild(listItem);
            });
        }
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.innerHTML = "";
        }
    });
});

