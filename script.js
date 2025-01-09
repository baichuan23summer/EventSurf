// Function to read pdf file and extract text
async function processPdf() {
    const fileInput = document.getElementById('pdfUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a PDF file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(event) {
        const arrayBuffer = event.target.result;

        try {
            let text = '';
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + '\n';
            }

            recommendEvents(text);
        } catch (error) {
            console.error("Error reading the PDF:", error);
            alert('Failed to process the PDF. Please try again.');
        }


    };

    reader.readAsArrayBuffer(file);
}

function recommendEvents(text) {
    const eventList = document.getElementById('eventList');
    const events = [
        { name: 'Concert XYZ', tags: ['music', 'concert'] },
        { name: 'Art Exhibition ABC', tags: ['art', 'exhibition'] },
        { name: 'Tech Conference 2023', tags: ['tech', 'conference'] }
    ];

    const recommendations = events.filter(event =>
        event.tags.some(tag => text.toLowerCase().includes(tag))
    );

    eventList.innerHTML = '';
    if (recommendations.length === 0) {
        eventList.innerHTML = '<li>No events match your preferences.</li>';
    } else {
        recommendations.forEach(event => {
            const li = document.createElement('li');
            li.textContent = event.name;
            eventList.appendChild(li);
        });
    }
}


// Function to show a specific page and hide others
function showPage(pageId) {
    var pages = document.getElementsByClassName('page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].style.display = 'none';
    }
    document.getElementById(pageId).style.display = 'block';

    // Initialize or adjust the map when the 'event-near-you' page is shown
    if (pageId === 'event-near-you') {
        setTimeout(function() {
            if (window.map) {
                window.map.invalidateSize(); // Refresh the map to fit the container
            }
        }, 0);
    }
}

// On page load, show the home page
window.onload = function() {
    showPage('home');

    // Handle action button clicks (like, going, not going)
    document.getElementById('eventPostsContainer').addEventListener('click', function(event) {
        if (event.target.classList.contains('action-button')) {
            var action = event.target.getAttribute('data-action');
            var postId = event.target.getAttribute('data-post-id');
            handleAction(action, postId);
            event.target.classList.toggle('active'); // Toggle active state
        }
    });
};

// Handle form submission for posting an event
document.getElementById('eventForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get user input
    var title = document.getElementById('eventTitle').value;
    var date = document.getElementById('eventDate').value;
    var time = document.getElementById('eventTime').value;
    var venue = document.getElementById('eventVenue').value;
    var description = document.getElementById('eventDescription').value;
    var image = document.getElementById('eventImage').files[0];

    // Create a new post element
    var postElement = document.createElement('div');
    postElement.classList.add('event-post');

    var imgElement = document.createElement('img');
    imgElement.src = image ? URL.createObjectURL(image) : 'default-image.jpg'; // Use a default image if none is provided
    imgElement.alt = 'Event Image';
    imgElement.classList.add('event-post-image');

    var contentElement = document.createElement('div');
    contentElement.classList.add('event-post-content');
    contentElement.innerHTML = `
        <h3>${title}</h3>
        <p><small>Posted on: ${new Date().toLocaleString()}</small></p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Venue:</strong> ${venue}</p>
        <p>${description}</p>
    `;

    var actionsElement = document.createElement('div');
    actionsElement.classList.add('event-post-actions');
    actionsElement.innerHTML = `
        <button class="action-button" data-action="like" data-post-id="${Date.now()}">Like</button>
        <button class="action-button" data-action="going" data-post-id="${Date.now()}">Going</button>
        <button class="action-button" data-action="not-going" data-post-id="${Date.now()}">Not Going</button>
    `;

    postElement.appendChild(imgElement);
    postElement.appendChild(contentElement);
    postElement.appendChild(actionsElement);
    document.getElementById('eventPostsContainer').appendChild(postElement);

    // Clear the form
    document.getElementById('eventForm').reset();
});

// Handle action button clicks (like, going, not going)
function handleAction(action, postId) {
    // Example: Send data to the server using Fetch API
    fetch('/api/post-action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: action, postId: postId }),
    })
    .then(response => response.json())
    .then(data => {
        // Update the count on the page based on the response
        updateCount(postId, action, data.count);
    })
    .catch(error => console.error('Error:', error));
}

// Function to update the count of likes, going, or not going
function updateCount(postId, action, count) {
    var button = document.querySelector(`.action-button[data-post-id="${postId}"][data-action="${action}"]`);
    if (button) {
        button.textContent = `${action} (${count})`;
    }
}

// Initialize the map for the 'event-near-you' page
function initializeMap() {
    var map = L.map('map').setView([34.4140, -119.8489], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add geocoder control
    var geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
    }).on('markgeocode', function(e) {
        var location = e.geocode.center;
        generateMarker(location, "Destination", true);
    }).addTo(map);

    // Add routing control
    var routingControl = L.Routing.control({
        waypoints: [],
        routeWhileDragging: true,
        geocoder: L.Control.Geocoder.nominatim(),
        showAlternatives: true,
    }).addTo(map);

    // Generate marker for current location
    function generateCurrentLocation() {
        navigator.geolocation.getCurrentPosition(function(position) {
            var currentLocation = [position.coords.latitude, position.coords.longitude];
            generateMarker(currentLocation, "Your Current Location");
        });
    }

    // Generate a marker on the map
    function generateMarker(location, popupText, isDestination = false) {
        map.setView(location, 15);
        var marker = L.marker(location).addTo(map).bindPopup(popupText).openPopup();
        if (isDestination) {
            routingControl.setWaypoints([L.latLng(currentLocation), L.latLng(location)]);
        }
    }

    // Search and generate a marker based on address input
    function searchAndGenerateMarker() {
        var address = document.getElementById('addressInput').value;
        geocoder.geocode(address, function(results) {
            if (results && results.length > 0) {
                var location = results[0].center;
                generateMarker(location, "Destination", true);
            } else {
                console.error("Unable to geocode address");
            }
        });
    }

    // Attach event listeners to map buttons
    document.getElementById('addressInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchAndGenerateMarker();
        }
    });

    document.getElementById('generateCurrentLocation').addEventListener('click', generateCurrentLocation);
    document.getElementById('searchAndGenerateMarker').addEventListener('click', searchAndGenerateMarker);
}

// Initialize the map when the page loads
initializeMap();
