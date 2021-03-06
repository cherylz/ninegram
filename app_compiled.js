'use strict';

var objectFitSupported = document.body.style.objectFit !== undefined ? true : false;
var promptMsg = document.querySelector('.instruction > p');
var modal = document.querySelector('.modal');
var searchFromUser = false;
var easterEggShown = false;
var scrolling = false;
var currentImageIndex;
var currentSearchTerm;

// If the easter egg was shown to the user during previous page visit(s), then it won't be displayed.
// Must be executed before conductSearch(searchTerm) because conductSearch needs the updated value of easterEggShown.
var easter = localStorage.getItem('easterEggShown');
if (easter) {
  easterEggShown = true;
}

// On page load, update the page with images fetched from API and add event listeners.
var randomTerms = ['architecture', 'city', 'mountain', 'london', 'moon'];
var searchTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];
conductSearch(searchTerm);

// Handle the keyup event when user pressed the enter key in the search box.
var inputBox = document.querySelector('input[type=text]');
inputBox.addEventListener('keyup', function(e) {
  if (e.key === 'Enter') {
    handleSearch();
  }
});

// Use event delegation to handle click events especially the events of dynamically rendered elements.
document.addEventListener('click', function(e) {
  if (e.target.closest('.search > button')) {
    handleSearch();
  }

  if (e.target.matches('.gallery-img')) {
    // Display the modal.
    modal.className = 'modal';

    // Display the corresponding image.
    currentImageIndex = parseInt(e.target.dataset.index);
    showSlide();
  }

  if (e.target.matches('.prev')) {
    handleSlideScroll(-1);
  }

  if (e.target.matches('.next')) {
    handleSlideScroll(1);
  }

  if (e.target.matches('.close')) {
    handleLightboxClose();
  }

  var inLightboxView = modal.className === 'modal' ? true : false; // In other words, if the modal's class name is 'modal no-display' instead of 'modal', it means the lightbox is hidden.
  if (!e.target.matches('.gallery-img') && inLightboxView) {
    decideWhetherToCloseLightbox(e);
  }

  if (e.target.matches('.easter-egg > button')) {
    handleEasterEgg();
  }
});

// Use event delegation to handle keydown events in the lightbox view.
document.addEventListener('keydown', function(e) {
  var inLightboxView = modal.className === 'modal' ? true : false;

  if (inLightboxView) {
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
      e.preventDefault(); // Prevent horizontal scrolling.

      handleSlideScroll(-1);
    }

    if (e.key === 'ArrowRight' || e.key === 'Right') {
      e.preventDefault(); // Prevent horizontal scrolling.

      handleSlideScroll(1);
    }

    if (e.key === 'Escape' || e.key === 'Esc') {
      handleLightboxClose();
    }
  }
});

// Make the navigation menu responsive to page scroll while use debouncing to care for browser performance.
window.addEventListener('scroll', function() {
  return (scrolling = true);
});
setInterval(function() {
  if (scrolling) {
    scrolling = false;

    if (document.body.scrollTop > 30 || document.documentElement.scrollTop > 30) {
      document.querySelector('header').style.height = '60px';
      document.querySelector('.navbar').style.height = '60px';
      document.querySelector('.search').style.height = '35px';
      document.querySelector('.search-input').style.height = '35px';
      document.querySelector('.search > button').style.height = '35px';
    } else {
      document.querySelector('header').style.height = '80px';
      document.querySelector('.navbar').style.height = '80px';
      document.querySelector('.search').style.height = '44px';
      document.querySelector('.search-input').style.height = '44px';
      document.querySelector('.search > button').style.height = '44px';
    }
  }
}, 200);

// Below are the functions to be called.

// -> Functions for lightbox:

function showSlide() {
  var slides = document.querySelectorAll('.slide');
  slides.forEach(function(slide, index) {
    if (index === currentImageIndex) {
      slide.className = 'slide active';
    } else {
      slide.className = 'slide';
    }
  });
}

function handleSlideScroll(num) {
  var slides = document.querySelectorAll('.slide');

  if (currentImageIndex + num >= slides.length) {
    currentImageIndex = 0;
  } else if (currentImageIndex + num === -1) {
    currentImageIndex = slides.length - 1;
  } else {
    currentImageIndex += num;
  }

  showSlide();
}

function handleLightboxClose() {
  // Update the prompt message.
  promptMsg.className = 'short';
  promptMsg.textContent = 'Hope you enjoyed the images!';

  // Close the lightbox.
  modal.className = 'modal no-display';
}

function decideWhetherToCloseLightbox(e) {
  var targetClass = e.target.className;

  if (
    targetClass !== 'close' &&
    targetClass !== 'prev' &&
    targetClass !== 'next' &&
    targetClass !== 'slide active' &&
    e.target.parentNode.className !== 'slide active'
  ) {
    handleLightboxClose();
  }
}

// -> Functions for image search:

function handleError(err) {
  if (searchFromUser) {
    promptMsg.className = '';
    promptMsg.textContent =
      'Oops... Something went wrong. Perhaps try another search term, or just enjoy the existing images below. :)';
  } else {
    promptMsg.className = 'prompt-color';
    promptMsg.textContent = 'Oops... Something went wrong. Please refresh the page.';
  }

  console.log(err, err.message);
}

function UpdatePage(result) {
  // Render proper prompt message.
  if (searchFromUser) {
    promptMsg.className = '';
    promptMsg.textContent =
      'Nice search! Click an image to zoom in and scroll through, or get new images with another search.';
  }

  // Render the 9 images fetched.
  var gallery = document.querySelector('.gallery-container');
  var galleryClass = objectFitSupported ? 'gallery-item' : 'gallery-item-ie';
  var htmlInGallery = result.reduce(function(str, item, index) {
    return (
      str +
      '<div class="'
        .concat(galleryClass, ' cell-')
        .concat(index + 1, '">\n        <img\n          src=')
        .concat(item.webformatURL.replace('_640', '_340'), '\n          alt="')
        .concat(item.tags, '"\n          data-index=')
        .concat(index, '\n          class="gallery-img">\n      </div>')
    );
  }, '');
  gallery.innerHTML = htmlInGallery;

  // Update content inside slideshow to be displayed in the lightbox view.
  var slideshow = document.querySelector('.slideshow');
  slideshow.innerHTML = '';
  var slideImgClass = objectFitSupported ? 'slide-img' : 'slide-img-ie';
  var htmlInSlideshow = result.reduce(function(str, item, index) {
    return (
      str +
      '<div class="slide">\n        <img\n          src='
        .concat(item.webformatURL.replace('_640', '_960'), '\n          srcset="')
        .concat(item.webformatURL.replace('_640', '_340'), ' 340w, ')
        .concat(item.webformatURL, ' 640w, ')
        .concat(
          item.webformatURL.replace('_640', '_960'),
          ' 960w"\n          sizes="80vw"\n          alt="'
        )
        .concat(item.tags, '"\n          class=')
        .concat(slideImgClass, '>\n        <div class="overlay">\n          tags: ')
        .concat(item.tags, '\n        </div>\n      </div>')
    );
  }, '');
  slideshow.innerHTML = htmlInSlideshow;

  // Upon the successful default search on page load, all the searches afterwards will be from user.
  if (!searchFromUser) {
    searchFromUser = true;
  }

  // Update easter egg.
  if (easterEggShown) {
    document.querySelector('.easter-egg').innerHTML = '';
  } else {
    document.querySelector('.easter-egg').innerHTML =
      '<button aria-label="Load more images">Load More</button>';
  }
}

function checkImageQtyThenUpdatePage(res) {
  var result = res.hits; // Check the 'Example' section on https://pixabay.com/api/docs/ for the API response's data structure.
  if (result.length < 9) {
    if (searchFromUser) {
      promptMsg.className = '';
      promptMsg.textContent =
        'Oops... Less than 9 images found. Why not try another search term? You can also just enjoy the existing images below. :)';
      return;
    } else {
      conductSearch('lights'); // Handle a rare case: the initial search on page load got less than 9 images to render.
      return;
    }
  }
  UpdatePage(result);
}

function validateResponse(res) {
  if (res.ok) {
    return res.json();
  }
  throw Error(res.statusText); // This function triggers the .catch block and prevents bad responses (non 200-299 responses in this case) from propagating down the fetch chain.
}

function conductSearch(term) {
  // Update the value of currentSearchTerm.
  currentSearchTerm = term;

  // Update prompt message.
  if (searchFromUser) {
    promptMsg.className = 'prompt-color short';
    promptMsg.textContent = 'Searching...';
  }

  // Fetch results from API and update page accordingly.
  var endpoint = 'https://pixabay.com/api/?key=11381563-185a2b7b89dac3ac1a22ea903&q='.concat(
    term,
    '&image_type=photo&min_width=295&min_height=295&per_page=9&editors_choice=true&safesearch=true'
  ); // Check the 'Parameters' section on https://pixabay.com/api/docs/ for elaboration.
  fetch(endpoint)
    .then(validateResponse)
    .then(checkImageQtyThenUpdatePage)
    ['catch'](handleError);
}

function handleSearch() {
  var cleanedInput = document.querySelector('input[type=text]').value.trim();
  var lettersExp = /^[A-Za-z\s]+$/; // Matches a string that contains letters and/or spaces only.

  if (!cleanedInput) {
    return;
  }

  if (cleanedInput === currentSearchTerm) {
    promptMsg.className = 'prompt-color short';
    promptMsg.textContent = 'Perhaps try another search term?';
    return;
  }

  if (!cleanedInput.match(lettersExp)) {
    promptMsg.className = 'prompt-color short';
    promptMsg.textContent =
      'Hmm... Only a search term with letters and spaces is accepted.';
    return;
  }

  if (cleanedInput.length > 100) {
    promptMsg.className = 'prompt-color';
    promptMsg.textContent =
      'Oops...The search term you entered is a bit long. Why not try a shorter one? :)';
    return;
  }

  // Finally, the search term is valid to trigger the actual search and corresponding actions.
  conductSearch(cleanedInput);
}

// -> Other function(s):

function handleEasterEgg() {
  document.querySelector('.easter-egg').innerHTML =
    "<p>You clicked the button, didn't you? They say less is more. So you are not getting more images. Good day ;)</p>";
  easterEggShown = true;
  localStorage.setItem('easterEggShown', 'true');
}
