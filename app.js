const objectFitSupported = document.body.style.objectFit !== undefined ? true : false;
const promptMsg = document.querySelector('.instruction > p');
let easterEggShown = false;
let scrolling = false;
let currentImageIndex;
let currentSearchTerm;

// If the easter egg was shown to the user during previous page visit(s), then it won't be displayed.
// Must be executed before updatePage(searchTerm, '') because updatePage needs the updated value of easterEggShown.
const easter = localStorage.getItem('easterEggShown');
if (easter) {
  easterEggShown = true;
}

// On page load, update the page with images fetched from API and add event listeners.
const randomTerms = ['architecture', 'city', 'mountain', 'london', 'moon'];
const searchTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];
updatePage(searchTerm, '');

// Add event listeners to the search box.
const inputBox = document.querySelector('input[type=text]');
const searchBtn = document.querySelector('.search > button');
inputBox.addEventListener('keyup', handleSearch);
searchBtn.addEventListener('click', handleSearch);

// Make the navigation menu responsive to page scroll.
window.addEventListener('scroll', () => (scrolling = true));
setInterval(() => {
  if (scrolling) {
    scrolling = false;
    if (document.body.scrollTop > 30 || document.documentElement.scrollTop > 30) {
      document.querySelector('header').style.height = '60px';
      document.querySelector('.navbar').style.height = '60px';
      document.querySelector('.search').style.height = '35px';
      document.querySelector('.search-input').style.height = '33px';
    } else {
      document.querySelector('header').style.height = '80px';
      document.querySelector('.navbar').style.height = '80px';
      document.querySelector('.search').style.height = '44px';
      document.querySelector('.search-input').style.height = '40px';
    }
  }
}, 200);

// Below are the functions to be called.

function showSlide() {
  const slides = document.querySelectorAll('.slide');
  slides.forEach((slide, index) => {
    if (index === currentImageIndex) {
      slide.className = 'slide active';
    } else {
      slide.className = 'slide';
    }
  });
}

function onImageClick() {
  const images = objectFitSupported
    ? document.querySelectorAll('.gallery-item > img')
    : document.querySelectorAll('.gallery-item-ie > img');
  images.forEach(image =>
    image.addEventListener('click', function(e) {
      // Display the modal.
      const modal = document.querySelector('.modal');
      modal.className = 'modal';

      // Display the corresponding image.
      currentImageIndex = parseInt(this.dataset.index);
      showSlide();
    })
  );
}

function handleSlideScroll(num) {
  const slides = document.querySelectorAll('.slide');
  if (currentImageIndex + num >= slides.length) {
    currentImageIndex = 0;
  } else if (currentImageIndex + num === -1) {
    currentImageIndex = slides.length - 1;
  } else {
    currentImageIndex += num;
  }
  showSlide();
}

function handleArrowKey(e) {
  const modal = document.querySelector('.modal');
  if (modal.className === 'modal') {
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
      e.preventDefault(); // Prevent horizontal scrolling.
      handleSlideScroll(-1);
    }

    if (e.key === 'ArrowRight' || e.key === 'Right') {
      e.preventDefault(); // Prevent horizontal scrolling.
      handleSlideScroll(1);
    }
  }
}

function handleEscKey(e) {
  const modal = document.querySelector('.modal');
  if (modal.className === 'modal') {
    if (e.key === 'Escape' || e.key === 'Esc') {
      handleLightboxClose();
    }
  }
}

function handleLightboxClose() {
  // Update the prompt message.
  promptMsg.className = 'short';
  promptMsg.textContent = 'Hope you enjoyed the images!';

  // Close the lightbox.
  document.querySelector('.modal').className = 'modal no-display';
}

function decideWhetherToCloseLightbox(e) {
  const targetClass = e.target.className;
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

function onSlideScroll() {
  document.querySelector('.prev').addEventListener('click', () => handleSlideScroll(-1));
  document.querySelector('.next').addEventListener('click', () => handleSlideScroll(1));
  document.addEventListener('keydown', handleArrowKey);
}

function onLightboxClose() {
  document.querySelector('.close').addEventListener('click', handleLightboxClose);
  document.addEventListener('keydown', handleEscKey);
  document
    .querySelector('.modal')
    .addEventListener('click', decideWhetherToCloseLightbox);
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
    `https://pixabay.com/api/?key=11381563-185a2b7b89dac3ac1a22ea903&q=${term}&image_type=photo&min_width=295&min_height=295&per_page=9&editors_choice=true&safesearch=true`
  )
    .then(res => {
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
    .then(res => {
      // Handle the case when less than 9 images are fetched
      const results = res.hits;
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
      }

      // Render images
      const gallery = document.querySelector('.gallery-container');
      const galleryClass = objectFitSupported ? 'gallery-item' : 'gallery-item-ie';
      const htmlInGallery = results.reduce(
        (str, item, index) =>
          str +
          `<div class="${galleryClass} cell-${index + 1}">
            <img
              src=${item.webformatURL.replace('_640', '_340')}
              alt="${item.tags}"
              data-index=${index}>
          </div>`,
        ''
      );
      gallery.innerHTML = htmlInGallery;

      // Render proper prompt message.
      if (from === 'user') {
        promptMsg.className = '';
        promptMsg.textContent =
          'Nice search! Click an image to zoom in and scroll through, or get new images with another search.';
      }

      // Add event listener to show the modal and corresponding image on click.
      onImageClick();

      // Update content inside the modal. the content includes a close icon, slideshow, a previous icon and a next icon.
      const modal = document.querySelector('.modal');
      modal.innerHTML = '';
      // -> step 1: create the close icon node
      const closeIcon = document.createElement('span');
      closeIcon.className = 'close';
      closeIcon.innerHTML = '&times;';
      // -> step 2: create the slideshow node
      const slideshowDiv = document.createElement('div');
      const slideImgClass = objectFitSupported ? 'slide-img' : 'slide-img-ie';
      const slides = results.reduce(
        (str, item, index) =>
          str +
          `<div class="slide">
            <img
              src=${item.webformatURL.replace('_640', '_960')}
              alt="${item.tags}"
              class=${slideImgClass}>
            <div class="overlay">
              tags: ${item.tags}
            </div>
          </div>`,
        ''
      );
      slideshowDiv.className = 'slideshow';
      slideshowDiv.innerHTML = slides;
      // -> step 3: create the previous icon node
      const prev = document.createElement('span');
      prev.className = 'prev';
      prev.innerHTML = '&#10094;';
      // -> step 4: create the next icon node
      const next = document.createElement('span');
      next.className = 'next';
      next.innerHTML = '&#10095;';
      // -> step 5: add the nodes created into the modal
      modal.appendChild(closeIcon);
      modal.appendChild(slideshowDiv);
      modal.appendChild(prev);
      modal.appendChild(next);

      // Add event listeners to scroll through slides.
      onSlideScroll();

      // Add event listeners to close the modal image gallery (i.e. lightbox).
      onLightboxClose();

      // Render the fake load more button.
      if (!easterEggShown) {
        const easterEgg = document.querySelector('.easter-egg');
        easterEgg.innerHTML = '<button>Load More</button>';
        document
          .querySelector('.easter-egg > button')
          .addEventListener('click', handleEasterEgg);
      }
    })
    .catch(err => {
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
  const searchTerm = document.querySelector('input[type=text]').value;

  if (!searchTerm) {
    return;
  }

  if (
    e.key === 'Enter' ||
    e.target.matches('.search > button') ||
    e.target.parentNode.matches('.search > button') ||
    e.target.parentNode.parentNode.matches('.search > button')
  ) {
    if (searchTerm === currentSearchTerm) {
      promptMsg.className = 'prompt-color short';
      promptMsg.textContent = 'Perhaps try another search term?';
      return;
    }
    if (searchTerm.length <= 100) {
      updatePage(searchTerm, 'user');
      currentSearchTerm = searchTerm;
    } else {
      promptMsg.className = 'prompt-color';
      promptMsg.textContent =
        'Oops...The search term you entered is a bit long. Why not try a shorter one? :)';
    }
  }
}

function handleEasterEgg() {
  document.querySelector('.easter-egg').innerHTML =
    "<p>You clicked the button, didn't you? They say less is more. So you are not getting more images. Good day ;)</p>";
  easterEggShown = true;
  localStorage.setItem('easterEggShown', true);
}
