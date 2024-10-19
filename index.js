document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.custom-select-wrapper').addEventListener('click', function () {
        this.querySelector('.custom-select').classList.toggle('opened');
    });

    document.querySelectorAll('.custom-option').forEach(option => {
        option.addEventListener('click', function () {
            if (!this.classList.contains('selected')) {
                this.parentNode.querySelector('.custom-option.selected')?.classList.remove('selected');
                this.classList.add('selected');
                this.closest('.custom-select').querySelector('.custom-select-trigger').textContent = this.textContent;
                document.querySelector('#car-category').value = this.getAttribute('data-value');
            }
        });
    });

    window.addEventListener('click', function (e) {
        const select = document.querySelector('.custom-select');
        if (!select.contains(e.target)) {
            select.classList.remove('opened');
        }
    });

});


document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar-default');
    const closeMenu = document.getElementById('close-menu');

    function toggleMenu() {
        navbar.classList.toggle('show');
        document.body.style.overflow = navbar.classList.contains('show') ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleMenu);
    closeMenu.addEventListener('click', toggleMenu);

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!navbar.contains(event.target) && !menuToggle.contains(event.target)) {
            navbar.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking a nav link (for mobile)
    const navLinks = navbar.getElementsByTagName('a');
    for (let link of navLinks) {
        link.addEventListener('click', function () {
            navbar.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
});

function toggleTripType(type) {
    const returnDateContainer = document.getElementById('return-date-container');
    const returnTimeContainer = document.getElementById('return-time-container');
    const returnPickupDate = document.getElementById('return-pickup-date');
    const returnPickupTime = document.getElementById('return-pickup-time');

    if (type === 'round-trip') {
        returnDateContainer.style.display = 'block';
        returnTimeContainer.style.display = 'block';

    } else {
        returnDateContainer.style.display = 'none';
        returnTimeContainer.style.display = 'none';
        returnPickupDate.required = false;
        returnPickupTime.required = false;
    }

    // Update active tab styling
    document.querySelector('[data-tab-target="one-way"]').classList.toggle('tab-active', type === 'one-way');
    document.querySelector('[data-tab-target="round-trip"]').classList.toggle('tab-active', type === 'round-trip');
}

// Initialize the form to one-way trip on page load
toggleTripType('one-way');
// Assume locations.csv is in the same directory as your HTML file
const csvFilePath = 'locations.csv';

let locations = [];

// Function to load and parse CSV file
async function loadLocations() {
    try {
        const response = await fetch(csvFilePath);
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.trim());

        // Assume the CSV has a header row
        const headers = rows[0].split(',');
        const locationIndex = headers.indexOf('Location');

        if (locationIndex === -1) {
            console.error('CSV file does not contain a "Location" column');
            return;
        }

        locations = rows.slice(1).map(row => row.split(',')[locationIndex]).filter(Boolean);
    } catch (error) {
        console.error('Error loading locations:', error);
    }
}

// Function to perform search
function searchLocations(query) {
    query = query.toLowerCase();
    return locations.filter(location => location.toLowerCase().includes(query));
}

// Function to update suggestions
function updateSuggestions(inputElement, suggestions) {
    const suggestionsList = inputElement.parentNode.querySelector('.suggestions');
    suggestionsList.innerHTML = '';
    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {
            inputElement.value = suggestion;
            suggestionsList.innerHTML = '';
        });
        suggestionsList.appendChild(li);
    });
}

// Function to initialize search functionality
function initializeSearch() {
    const pickupInput = document.getElementById('pickup-location');
    const dropInput = document.getElementById('drop-location');

    [pickupInput, dropInput].forEach(input => {
        const suggestionsList = document.createElement('ul');
        suggestionsList.className = 'suggestions';
        input.parentNode.appendChild(suggestionsList);

        input.addEventListener('input', () => {
            const query = input.value;
            if (query.length >= 2) {
                const suggestions = searchLocations(query);
                updateSuggestions(input, suggestions.slice(0, 5)); // Limit to 5 suggestions
            } else {
                updateSuggestions(input, []);
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target !== input && !suggestionsList.contains(e.target)) {
                updateSuggestions(input, []);
            }
        });
    });
}

// Load locations and initialize search when the page is loaded
window.addEventListener('DOMContentLoaded', async () => {
    await loadLocations();
    initializeSearch();
});

function initializeCarCategorySelection() {
    const carCategoryItems = document.querySelectorAll('.car-category-item');
    const carCategoryInput = document.getElementById('car-category');

    carCategoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove 'selected' class from all items
            carCategoryItems.forEach(i => i.classList.remove('selected'));

            // Add 'selected' class to clicked item
            item.classList.add('selected');

            // Update hidden input value
            carCategoryInput.value = item.dataset.value;
        });
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    await loadLocations();
    initializeSearch();
    initializeCarCategorySelection();
});

document.addEventListener('DOMContentLoaded', function () {
    const bookButtons = document.querySelectorAll('.book-btn');

    bookButtons.forEach(button => {
        button.addEventListener('click', function () {
            const routeCard = this.closest('.route-card');
            const from = routeCard.querySelector('.from').textContent.replace('From: ', '').trim();
            const to = routeCard.querySelector('.to').textContent.replace('To: ', '').trim();

            // Populate the form fields
            document.getElementById('pickup-location').value = from;
            document.getElementById('drop-location').value = to;

            // Set the trip type to one-way
            toggleTripType('one-way');

            // Scroll to the form
            const form = document.querySelector('body');
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Optional: Set focus on the first empty required field
            // const requiredFields = form.querySelectorAll('input[required]');
            // for (let field of requiredFields) {
            //     if (!field.value) {
            //         field.focus();
            //         break;
            //     }
            // }
        });
    });
});

// Make sure this function is available in your global scope
function toggleTripType(type) {
    const returnContainers = ['return-date-container', 'return-time-container'].map(id => document.getElementById(id));
    const returnInputs = ['return-pickup-date', 'return-pickup-time'].map(id => document.getElementById(id));
    const isRoundTrip = type === 'round-trip';

    returnContainers.forEach(container => container.style.display = isRoundTrip ? 'block' : 'none');
    // returnInputs.forEach(input => input.required = isRoundTrip);

    document.querySelector('[data-tab-target="one-way"]').classList.toggle('tab-active', !isRoundTrip);
    document.querySelector('[data-tab-target="round-trip"]').classList.toggle('tab-active', isRoundTrip);
}

window.addEventListener('scroll', function () {
    const nav = document.querySelector('.fixed-nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const oneWayBtn = document.getElementById('one-way-tariff');
    const roundTripBtn = document.getElementById('round-trip-tariff');
    const tariffCards = document.querySelectorAll('.tariff-card');

    function updateTariffs(isRoundTrip) {
        tariffCards.forEach(card => {
            const rate = card.querySelector('p:nth-child(4)');
            const currentRate = parseFloat(rate.textContent.match(/₹(\d+(\.\d+)?)/)[1]);
            const newRate = isRoundTrip ? currentRate * 0.9 : currentRate / 0.9; // 10% discount for round trips
            rate.innerHTML = `<strong>Rate:</strong> ₹${newRate.toFixed(2)} per km`;
        });
    }

    oneWayBtn.addEventListener('click', function () {
        oneWayBtn.classList.add('active');
        roundTripBtn.classList.remove('active');
        updateTariffs(false);
    });

    roundTripBtn.addEventListener('click', function () {
        roundTripBtn.classList.add('active');
        oneWayBtn.classList.remove('active');
        updateTariffs(true);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const oneWayTermsBtn = document.getElementById('one-way-terms');
    const roundTripTermsBtn = document.getElementById('round-trip-terms');
    const oneWayTermsContent = document.getElementById('one-way-terms-content');
    const roundTripTermsContent = document.getElementById('round-trip-terms-content');

    function toggleTerms(showOneWay) {
        if (showOneWay) {
            oneWayTermsBtn.classList.add('active');
            roundTripTermsBtn.classList.remove('active');
            oneWayTermsContent.classList.remove('hidden');
            roundTripTermsContent.classList.add('hidden');
        } else {
            roundTripTermsBtn.classList.add('active');
            oneWayTermsBtn.classList.remove('active');
            roundTripTermsContent.classList.remove('hidden');
            oneWayTermsContent.classList.add('hidden');
        }
    }

    oneWayTermsBtn.addEventListener('click', function () {
        toggleTerms(true);
    });

    roundTripTermsBtn.addEventListener('click', function () {
        toggleTerms(false);
    });
});