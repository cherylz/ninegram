'use strict';

var objectFitSupported = document.body.style.objectFit !== undefined ? true : false;
var promptMsg = document.querySelector('.instruction > p');
var modal = document.querySelector('.modal');
var easterEggShown = false;
var scrolling = false;
var currentImageIndex;
var currentSearchTerm; // If the easter egg was shown to the user during previous page visit(s), then it won't be displayed.
// Must be executed before updatePage(searchTerm, '') because updatePage needs the updated value of easterEggShown.

var easter = localStorage.getItem('easterEggShown');

if (easter) {
  easterEggShown = true;
} // On page load, update the page with images fetched from API and add event listeners.

var randomTerms = ['architecture', 'city', 'mountain', 'london', 'moon'];
var searchTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];
updatePage(searchTerm, ''); // Handle the keyup event when user pressed the enter key in the search box.

var inputBox = document.querySelector('input[type=text]');
inputBox.addEventListener('keyup', function(e) {
  if (e.key === 'Enter') {
    handleSearch();
  }
}); // Use event delegation to handle click events especially the events of dynamically rendered elements.

document.addEventListener('click', function(e) {
  if (e.target.closest('.search > button')) {
    handleSearch();
  }

  if (e.target.matches('.gallery-img')) {
    // Display the modal.
    modal.className = 'modal'; // Display the corresponding image.

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

  if (!e.target.matches('.gallery-img') && modal.className === 'modal') {
    decideWhetherToCloseLightbox(e);
  }

  if (e.target.matches('.easter-egg > button')) {
    handleEasterEgg();
  }
}); // Use event delegation to handle keydown events in the lightbox view.

document.addEventListener('keydown', function(e) {
  if (modal.className === 'modal') {
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
}); // Make the navigation menu responsive to page scroll.

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
}, 200); // Below are the functions to be called.

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
  promptMsg.textContent = 'Hope you enjoyed the images!'; // Close the lightbox.

  document.querySelector('.modal').className = 'modal no-display';
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

function updatePage(term, from) {
  if (easterEggShown) {
    document.querySelector('.easter-egg').innerHTML = '';
  }

  if (from === 'user') {
    promptMsg.className = 'prompt-color short';
    promptMsg.textContent = 'Searching...';
  }

  fetch(
    'https://pixabay.com/api/?key=11381563-185a2b7b89dac3ac1a22ea903&q='.concat(
      term,
      '&image_type=photo&min_width=295&min_height=295&per_page=9&editors_choice=true&safesearch=true'
    )
  )
    .then(function(res) {
      if (res.ok) {
        return res.json();
      }

      if (from === 'user') {
        promptMsg.className = '';
        promptMsg.textContent =
          'Oops... Something went wrong. Perhaps try another search term, or just enjoy the existing images below. :)';
      } else {
        promptMsg.className = 'prompt-color';
        promptMsg.textContent = 'Oops... Something went wrong. Please refresh the page.';
      }

      throw Error(res.statusText);
    })
    .then(function(res) {
      // Handle the case when less than 9 images are fetched
      var results = res.hits;

      if (results.length < 9) {
        if (from === 'user') {
          promptMsg.className = '';
          promptMsg.textContent =
            'Oops... Less than 9 images found. Why not try another search term? You can also just enjoy the existing images below. :)';
          return;
        } else {
          updatePage('lights', ''); // Handle a rare case: the initial search on page load got less than 9 images to render.

          return;
        }
      } // Render images

      var gallery = document.querySelector('.gallery-container');
      var galleryClass = objectFitSupported ? 'gallery-item' : 'gallery-item-ie';
      var htmlInGallery = results.reduce(function(str, item, index) {
        return (
          str +
          '<div class="'
            .concat(galleryClass, ' cell-')
            .concat(index + 1, '">\n            <img\n              src=')
            .concat(item.webformatURL.replace('_640', '_340'), '\n              alt="')
            .concat(item.tags, '"\n              data-index=')
            .concat(index, '\n              class="gallery-img">\n          </div>')
        );
      }, '');
      gallery.innerHTML = htmlInGallery; // Render proper prompt message.

      if (from === 'user') {
        promptMsg.className = '';
        promptMsg.textContent =
          'Nice search! Click an image to zoom in and scroll through, or get new images with another search.';
      } // Update content inside the slideshow.

      var slideshow = document.querySelector('.slideshow');
      slideshow.innerHTML = '';
      var slideImgClass = objectFitSupported ? 'slide-img' : 'slide-img-ie';
      var htmlInSlideshow = results.reduce(function(str, item, index) {
        return (
          str +
          '<div class="slide">\n            <img\n              src='
            .concat(item.webformatURL.replace('_640', '_960'), '\n              alt="')
            .concat(item.tags, '"\n              class=')
            .concat(
              slideImgClass,
              '>\n            <div class="overlay">\n              tags: '
            )
            .concat(item.tags, '\n            </div>\n          </div>')
        );
      }, '');
      slideshow.innerHTML = htmlInSlideshow; // Render the fake load more button.

      if (!easterEggShown) {
        document.querySelector('.easter-egg').innerHTML = '<button>Load More</button>';
      }
    })
    ['catch'](function(err) {
      if (from === 'user') {
        promptMsg.className = '';
        promptMsg.textContent =
          'Oops... Something went wrong. Perhaps try another search term, or just enjoy the existing images below. :)';
      } else {
        promptMsg.className = 'prompt-color';
        promptMsg.textContent = 'Oops... Something went wrong. Please refresh the page.';
      }

      console.log(err, err.message);
    });
}

function handleSearch(e) {
  var searchTerm = document.querySelector('input[type=text]').value;

  if (!searchTerm) {
    return;
  }

  if (searchTerm === currentSearchTerm) {
    promptMsg.className = 'prompt-color short';
    promptMsg.textContent = 'Perhaps try another search term?';
    return;
  }

  if (searchTerm.length <= 100) {
    currentSearchTerm = searchTerm;
    updatePage(searchTerm, 'user');
  } else {
    promptMsg.className = 'prompt-color';
    promptMsg.textContent =
      'Oops...The search term you entered is a bit long. Why not try a shorter one? :)';
  }
}

function handleEasterEgg() {
  document.querySelector('.easter-egg').innerHTML =
    "<p>You clicked the button, didn't you? They say less is more. So you are not getting more images. Good day ;)</p>";
  easterEggShown = true;
  localStorage.setItem('easterEggShown', true);
}
