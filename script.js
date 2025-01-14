AOS.init();
const root = document.documentElement;
const marqueeElementsDisplayed = getComputedStyle(root).getPropertyValue("--marquee-elements-displayed");
const marqueeContent = document.querySelector("ul.marquee-content");

root.style.setProperty("--marquee-elements", marqueeContent.children.length);

for(let i=0; i<marqueeElementsDisplayed; i++) {
  marqueeContent.appendChild(marqueeContent.children[i].cloneNode(true));
}


// Load CSV file
fetch('broadband_data.csv')
    .then(response => response.text())
    .then(csvText => {
        const rows = csvText.split('\n').slice(1); // Remove the header row
        broadbandData = rows.map(row => {
            const [Provider, Plan, Price, Speed, ZipCode, City, State, ImagePath, Rating, Connection] = row.split(',');

            return {
                Provider: Provider?.trim(),
                Plan: Plan?.trim(),
                Price: Price?.trim(),
                Speed: Speed?.trim(),
                ZipCode: ZipCode?.trim(),
                City: City?.trim(),
                State: State?.replace(/"/g, '').split(';').map(s => s.trim()), // Parse state array
                ImagePath: ImagePath?.trim(),
                Rating: parseFloat(Rating) || 0,
                Connection: Connection?.trim(),
            };
        });

        console.log("Broadband data loaded:", broadbandData);
    })
    .catch(error => console.error('Error loading CSV:', error));

function displayBroadbandInfoForState(stateName, broadbandData) {
    const broadbandInfo = document.querySelector('#broadband-info');

    if (!broadbandInfo) {
        console.error('Error: Could not find the #broadband-info element in the DOM.');
        return;
    }

    // Filter broadband data by state
    const stateData = broadbandData.filter(entry => entry.State.includes(stateName));

    if (stateData.length === 0) {
        broadbandInfo.innerHTML = `
            <h3>Broadband Data for ${stateName}</h3>
            <p>No broadband data available for this state.</p>
        `;
        return;
    }

    // Deduplicate by Provider and limit to 5 entries
    const uniqueProviders = new Set();
    const deduplicatedData = stateData.filter(entry => {
        if (!uniqueProviders.has(entry.Provider)) {
            uniqueProviders.add(entry.Provider);
            return true;
        }
        return false;
    }).slice(0, 8); // Limit to 5 entries

    broadbandInfo.innerHTML = generateCards(`Broadband Data for ${stateName}`, deduplicatedData);
}

function generateCards(title, data) {
    const cards = data.map(entry => `
        <div class="provider-card" data-aos="fade-up">
            <div class="provider-card-header">
                <h3>${entry.Provider || 'Unknown Provider'}</h3>
                <p class="availability">
                    <img src="imgs/check.svg" alt="Check" class="check-icon">
                    ${entry.Availability || 'Available'}
                </p>
            </div>
            <div class="provider-card-main">
                <div class="provider-logo-container">
                    <img src="${entry.ImagePath || ''}" alt="${entry.Provider} Logo" class="provider-logo">
                </div>
                <div class="provider-connection">
                    <p><strong>Connection:</strong> ${entry.Connection || 'N/A'}</p>
                    <p><strong>Price:</strong> ${entry.Price || 'N/A'}</p>
                </div>
                <div class="provider-speed">
                    <p><strong>Download speeds up to:</strong></p>
                    <p class="speed-value">${entry.Speed || 'N/A'}</p>
                </div>
                <div class="provider-rating">
                    <div class="stars">
                        ${generateStars(entry.Rating || 0)}
                    </div>
                    <p class="user-rating">User Rating (${entry.Rating || '0'})</p>
                </div>
                <div class="provider-button">
                    <button class="view-plan-btn"><a href="tel:+18886962230">Call us <br>888-696-2230</a></button>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <h3>${title}</h3>
        <div class="cards-container">
            ${cards}
        </div>
    `;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return `
        ${'<span class="star full">&#9733;</span>'.repeat(fullStars)}
        ${'<span class="star empty">&#9734;</span>'.repeat(emptyStars)}
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const map = document.querySelector('#us-map'); // Assuming an SVG map with state paths
    const broadbandInfo = document.querySelector('#broadband-info');

    map.querySelectorAll('path').forEach(statePath => {
        statePath.addEventListener('click', () => {
            const stateName = statePath.getAttribute('data-name'); // Assuming states have a 'data-name' attribute
            displayBroadbandInfoForState(stateName, broadbandData);
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");

    const searchButton = document.getElementById('search-button');
    const zipCodeInput = document.getElementById('zip-code-input');
    const broadbandInfo = document.getElementById('broadband-info');
    console.log("Elements loaded: ", { searchButton, zipCodeInput, broadbandInfo });

    let broadbandData = [];

    // Fetch the CSV file
    fetch('broadband_data.csv')
        .then(response => {
            console.log("CSV fetch response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            const rows = csvText.split('\n').slice(1); // Skip header
            broadbandData = rows.map(row => {
                const [Provider, Plan, Price, Speed, ZipCode, City, State] = row.split(',');

                const entry = {
                    Provider: Provider?.trim(),
                    Plan: Plan?.trim(),
                    Price: Price?.trim(),
                    Speed: Speed?.trim(),
                    ZipCode: ZipCode?.trim(),
                    City: City?.trim(),
                    State: State?.trim()
                };

                console.log("Parsed row: ", entry);
                return entry;
            });

            //console.log("Parsed broadband data: ", broadbandData);
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
        const zipData = data.filter(entry => entry.ZipCode === zipCode);
        console.log("Filtered data for ZIP:", zipData);

        if (zipData.length === 0) {
            broadbandInfo.innerHTML = `<p>No broadband data available for ZIP code: ${zipCode}</p>`;
            return;
        }

        const tableHeader = `
            <table>
                <thead>
                    <tr>
                        <th>Provider</th>
                        <th>Plan</th>
                        <th>Price</th>
                        <th>Speed</th>
                        <th>Zip Code</th>
                        <th>City</th>
                        <th>State</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const tableRows = zipData.map(entry => `
            <tr>
                <td>${entry.Provider}</td>
                <td>${entry.Plan}</td>
                <td>${entry.Price}</td>
                <td>${entry.Speed}</td>
                <td>${entry.ZipCode}</td>
                <td>${entry.City}</td>
                <td>${entry.State}</td>
            </tr>
        `).join('');

        broadbandInfo.innerHTML = tableHeader + tableRows + '</tbody></table>';
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
