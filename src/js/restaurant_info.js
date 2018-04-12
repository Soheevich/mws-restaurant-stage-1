/* eslint-env browser */

let restaurant;
let map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurantProp) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurantProp.latlng,
        scrollwheel: false,
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(restaurant, map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (restaurant) { // restaurant already fetched!
    callback(null, restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    const error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurantProp) => {
      restaurant = restaurantProp;
      if (!restaurantProp) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurantProp);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurantProp = restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurantProp.name;
  name.tabIndex = 0;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurantProp.address;
  address.tabIndex = 0;

  const picture = document.getElementById('restaurant-img');
  picture.className = 'restaurant-img';

  const source = document.createElement('source');
  source.setAttribute('sizes', '(max-width: 750px) 700px, (min-width: 751px) 48vw');
  source.setAttribute('srcset', DBHelper.imagesWebpSrcsetForRestaurant(restaurant));
  source.setAttribute('type', 'image/webp');
  picture.append(source);

  const image = document.createElement('img');
  image.src = DBHelper.imageSrcForRestaurant(restaurant);
  image.alt = `The restaurant ${restaurant.name}`;
  image.sizes = '(max-width: 750px) 700px, (min-width: 751px) 48vw';
  image.srcset = DBHelper.imagesJpgSrcsetForRestaurant(restaurant);
  picture.append(image);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurantProp.cuisine_type;
  cuisine.tabIndex = 0;

  // fill operating hours
  if (restaurantProp.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHoursProp = restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  Object.keys(operatingHoursProp).forEach((key) => {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHoursProp[key];
    row.appendChild(time);

    hours.appendChild(row);
  });
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviewsProp = restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviewsProp) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviewsProp.forEach((review) => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('h4');
  name.className = 'review__name';
  name.textContent = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.className = 'review__date';
  date.textContent = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.className = 'review__rating';
  rating.textContent = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.textContent = review.comments;
  comments.tabIndex = 0;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurantProp = restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurantProp.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url = window.location.href) => {
  const newName = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${newName}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
