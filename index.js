// Global variables
let locations = [];

// DOM Content Loaded Event Listeners
document.addEventListener('DOMContentLoaded', async function () {
    initializeCustomSelect();
    initializeMenuToggle();
    initializeCarCategorySelection();
    initializeTariffToggle();
    initializeTermsToggle();
    await loadLocations();
    initializeSearch();
    initializeRouteCardButtons();
});

// Window Event Listeners
window.addEventListener('scroll', handleNavScroll);
window.addEventListener('click', closeCustomSelectOutside);

// Custom Select Functionality
function initializeCustomSelect() {
    const wrapper = document.querySelector('.custom-select-wrapper');
    const options = document.querySelectorAll('.custom-option');

    wrapper.addEventListener('click', toggleCustomSelect);
    options.forEach(option => option.addEventListener('click', selectCustomOption));
}

function toggleCustomSelect() {
    this.querySelector('.custom-select').classList.toggle('opened');
}

function selectCustomOption() {
    if (!this.classList.contains('selected')) {
        this.parentNode.querySelector('.custom-option.selected')?.classList.remove('selected');
        this.classList.add('selected');
        this.closest('.custom-select').querySelector('.custom-select-trigger').textContent = this.textContent;
        document.querySelector('#car-category').value = this.getAttribute('data-value');
    }
}

function closeCustomSelectOutside(e) {
    const select = document.querySelector('.custom-select');
    if (select && !select.contains(e.target)) {
        select.classList.remove('opened');
    }
}

// Menu Toggle Functionality
function initializeMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.getElementById('navbar-default');
    const closeMenu = document.getElementById('close-menu');

    menuToggle.addEventListener('click', toggleMenu);
    closeMenu.addEventListener('click', toggleMenu);
    document.addEventListener('click', closeMenuOutside);

    const navLinks = navbar.getElementsByTagName('a');
    for (let link of navLinks) {
        link.addEventListener('click', closeMenu);
    }
}

function toggleMenu() {
    const navbar = document.getElementById('navbar-default');
    navbar.classList.toggle('show');
    document.body.style.overflow = navbar.classList.contains('show') ? 'hidden' : '';
}

function closeMenuOutside(event) {
    const navbar = document.getElementById('navbar-default');
    const menuToggle = document.getElementById('menu-toggle');
    if (!navbar.contains(event.target) && !menuToggle.contains(event.target)) {
        navbar.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Trip Type Toggle Functionality
function toggleTripType(type) {
    const returnElements = ['return-date-container', 'return-time-container', 'return-pickup-date', 'return-pickup-time'];
    const isRoundTrip = type === 'round-trip';

    returnElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id.includes('container')) {
                element.style.display = isRoundTrip ? 'block' : 'none';
            } else {
                element.required = isRoundTrip;
            }
        }
    });

    document.querySelector('[data-tab-target="one-way"]').classList.toggle('tab-active', !isRoundTrip);
    document.querySelector('[data-tab-target="round-trip"]').classList.toggle('tab-active', isRoundTrip);
}

// Location Search Functionality
async function loadLocations() {
    try {
        const response = await fetch('locations.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => row.trim());
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

function searchLocations(query) {
    query = query.toLowerCase();
    return locations.filter(location => location.toLowerCase().includes(query));
}

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

function initializeSearch() {
    const inputs = ['pickup-location', 'drop-location'].map(id => document.getElementById(id));

    inputs.forEach(input => {
        const suggestionsList = document.createElement('ul');
        suggestionsList.className = 'suggestions';
        input.parentNode.appendChild(suggestionsList);

        input.addEventListener('input', () => {
            const query = input.value;
            if (query.length >= 2) {
                const suggestions = searchLocations(query);
                updateSuggestions(input, suggestions.slice(0, 5));
            } else {
                updateSuggestions(input, []);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target !== input && !suggestionsList.contains(e.target)) {
                updateSuggestions(input, []);
            }
        });
    });
}

// Car Category Selection
function initializeCarCategorySelection() {
    const carCategoryItems = document.querySelectorAll('.car-category-item');
    const carCategoryInput = document.getElementById('car-category');

    carCategoryItems.forEach(item => {
        item.addEventListener('click', () => {
            carCategoryItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            carCategoryInput.value = item.dataset.value;
        });
    });
}

// Route Card Buttons
function initializeRouteCardButtons() {
    const bookButtons = document.querySelectorAll('.book-btn');

    bookButtons.forEach(button => {
        button.addEventListener('click', function () {
            const routeCard = this.closest('.route-card');
            const from = routeCard.querySelector('.from').textContent.replace('From: ', '').trim();
            const to = routeCard.querySelector('.to').textContent.replace('To: ', '').trim();

            document.getElementById('pickup-location').value = from;
            document.getElementById('drop-location').value = to;
            toggleTripType('one-way');

            document.querySelector('body').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// Nav Scroll Effect
function handleNavScroll() {
    const nav = document.querySelector('.fixed-nav');
    nav.classList.toggle('scrolled', window.scrollY > 50);
}

// Tariff Toggle
function initializeTariffToggle() {
    const oneWayBtn = document.getElementById('one-way-tariff');
    const roundTripBtn = document.getElementById('round-trip-tariff');
    const tariffCards = document.querySelectorAll('.tariff-card');

    function updateTariffs(isRoundTrip) {
        tariffCards.forEach(card => {
            const rate = card.querySelector('p:nth-child(4)');
            const currentRate = parseFloat(rate.textContent.match(/₹(\d+(\.\d+)?)/)[1]);
            const newRate = isRoundTrip ? currentRate * 0.9 : currentRate / 0.9;
            rate.innerHTML = `<strong>Rate:</strong> ₹${newRate.toFixed(2)} per km`;
        });
    }

    oneWayBtn.addEventListener('click', () => {
        oneWayBtn.classList.add('active');
        roundTripBtn.classList.remove('active');
        updateTariffs(false);
    });

    roundTripBtn.addEventListener('click', () => {
        roundTripBtn.classList.add('active');
        oneWayBtn.classList.remove('active');
        updateTariffs(true);
    });
}

// Terms Toggle
function initializeTermsToggle() {
    const oneWayTermsBtn = document.getElementById('one-way-terms');
    const roundTripTermsBtn = document.getElementById('round-trip-terms');
    const oneWayTermsContent = document.getElementById('one-way-terms-content');
    const roundTripTermsContent = document.getElementById('round-trip-terms-content');

    function toggleTerms(showOneWay) {
        oneWayTermsBtn.classList.toggle('active', showOneWay);
        roundTripTermsBtn.classList.toggle('active', !showOneWay);
        oneWayTermsContent.classList.toggle('hidden', !showOneWay);
        roundTripTermsContent.classList.toggle('hidden', showOneWay);
    }

    oneWayTermsBtn.addEventListener('click', () => toggleTerms(true));
    roundTripTermsBtn.addEventListener('click', () => toggleTerms(false));
}

// Initialize one-way trip on page load
toggleTripType('one-way');

