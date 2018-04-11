/* eslint-env browser */

let restaurants;
let neighborhoods;
let cuisines;
let map;
let markers = [];


/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoodsProp = neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoodsProp.forEach((neighborhood) => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoodsProp) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      neighborhoods = neighborhoodsProp;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisinesProp) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      cuisines = cuisinesProp;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisinesProp = cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisinesProp.forEach((cuisine) => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurantsProp) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurantsProp);
      fillRestaurantsHTML();
    }
  })
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  const loc = {
    lat: 40.722216,
    lng: -73.987501,
  };
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false,
  });
  updateRestaurants();
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurantsProp) => {
  // Remove all restaurants
  restaurants = [];
  const restaurantsList = document.getElementById('restaurants-list');
  restaurantsList.innerHTML = '';

  // Remove all map markers
  markers.forEach(m => m.setMap(null));
  markers = [];
  restaurants = restaurantsProp;
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const div = document.createElement('div');
  div.className = 'restaurants-element';

  const picture = document.createElement('picture');

  const source = document.createElement('source');
  source.setAttribute('sizes', '(max-width: 730px) 570px, (min-width: 731px) 270px');
  source.setAttribute('srcset', DBHelper.imagesWebpSrcsetForRestaurant(restaurant));
  source.setAttribute('type', 'image/webp');
  picture.append(source);

  const image = document.createElement('img');
  image.src = DBHelper.imageSrcForRestaurant(restaurant);
  image.alt = `Picture of the restaurant ${restaurant.name}`;
  image.sizes = '(max-width: 730px) 570px, (min-width: 731px) 270px';
  image.srcset = DBHelper.imagesJpgSrcsetForRestaurant(restaurant);
  picture.append(image);

  div.append(picture);

  const name = document.createElement('h1');
  name.textContent = restaurant.name;
  name.tabIndex = 0;
  div.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.textContent = restaurant.neighborhood;
  div.append(neighborhood);

  const address = document.createElement('p');
  address.textContent = restaurant.address;
  div.append(address);

  const more = document.createElement('a');
  more.textContent = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  div.append(more);

  return div;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurantsProp = restaurants) => {
  const restaurantsList = document.getElementById('restaurants-list');
  restaurantsProp.forEach((restaurant) => {
    restaurantsList.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurantsProp = restaurants) => {
  restaurantsProp.forEach((restaurant) => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    markers.push(marker);
  });
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

// register service worker

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js').then((reg) => {
    if (reg.installing) {
      console.log('Service worker installing');
    } else if (reg.waiting) {
      console.log('Service worker installed');
    } else if (reg.active) {
      console.log('Service worker active');
    }
  }).catch((error) => {
    // registration failed
    console.log(`Registration failed with ${error}`);
  });
}
