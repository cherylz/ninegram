# Ninegram - Get Inspired by 9 Images

[live demo](https://ninegram.netlify.com)

![Screenshot of Ninegram](https://i.ibb.co/GxjpZ2p/Screenshot-of-Ninegram.png)

### Table of Contents

[Problem](https://github.com/cherylz/ninegram#problem)

[Solution](https://github.com/cherylz/ninegram#solution)

[Go the Extra Mile](https://github.com/cherylz/ninegram#go-the-extra-mile)

[How to Use or Build Ninegram](https://github.com/cherylz/ninegram#how-to-use-or-build-ninegram)

[Technical Choices](https://github.com/cherylz/ninegram#technical-choices)

[Test Plan](https://github.com/cherylz/ninegram#test-plan)

[Discussion](https://github.com/cherylz/ninegram#discussion)

[In Case You Want to Know More](https://github.com/cherylz/ninegram#in-case-you-want-to-know-more)

## Problem

Build an image gallery web app that shows at least 5 images fetched from a public API. On image click, the app should display that image in a lightbox view, with next/previous buttons to move to the next/previous image. The UI should work without refreshing.

The app should run without errors in the latest versions of Chrome, Safari, Firefox, and IE.

Only native JavaScript should be used.

## Solution

I used native JavaScript, HTML, and native CSS to build the app and named it Ninegram. Images are fetched from a free public API service - [Pixabay API](https://pixabay.com/api/docs/) (thank you, Pixabay).

The app was tested in the latest versions of Chrome, Safari, Firefox, and IE. For Chrome, Safari and Firefox, I used their apps for Mac. For IE, I used [VirtualBox](https://www.virtualbox.org/wiki/VirtualBox) to test [IE11 on Windows 10](https://www.microsoft.com/en-us/software-download/windows10ISO).

## Go the Extra Mile

In addition to the basic requirements, I've added a few things as below.

Functionality:

- Add a search feature so users can not only view the images served by the app but also search for the images they want to see.

Data validation and error handling:

- Validate input and show the corresponding message when users input a term to search for images.
- Handle errors when image fetching meets bad responses (like 404s) or no network connection.

UI/UX design:

- Set the design principles to be simple and functional so users can focus on the images instead of being distracted by the app.
- Make the page responsive to different screen sizes.
- Show image tags in the lightbox view (on hover) to give users more info about the image they are looking at.
- Use image tags as the alternative text of an image to improve accessibility for people using screen readers.
- Add an 'easter egg' (i.e. the load-more button after the 9 images) to bring more fun to users.

## How to Use or Build Ninegram

Go to [Ninegram](https://ninegram.netlify.com), follow the instructions there, and have fun. :)

Feel free to fork this repo and make your own Ninegram. This repo contains the exact code that makes Ninegram run. You can use my API key to access the Pixabay API as long as it's a [fair use](https://pixabay.com/api/docs/#api_rate_limit). If you need support, please shoot me an [email](mailto:czcodes@gmail.com).

## Technical Choices

The app was built with JavaScript, HTML, and CSS since it's a front-end app without a back-end. I used native JavaScript to follow the project requirement. Though not required, I used CSS without frameworks because I'm more familiar with vanilla CSS compared to frameworks. In a production environment:

- I might choose a JavaScript framework/library such as React for its state management, the ease of use in dynamic component rendering and DOM manipulation, and its underlying benefits like minifying files and post-processing CSS.
- I might use a CSS framework such as Bootstrap in accordance with the team/client's tech stack.

[Netlify](https://www.netlify.com/) was used for deployment because its minimal configuration makes testing fast and it's enough for this app.

To support IE11:

- [Polyfill.io](https://polyfill.io/v3/) was used to get the polyfills of the browser features not supported by IE11 such as Promise and fetch. To see how it worked, search `polyfillJS` in [index.html](https://github.com/cherylz/ninegram/blob/master/index.html).
- [Babel](https://babeljs.io/) was used to compile [app.js](https://github.com/cherylz/ninegram/blob/master/app.js) written with ES6 into [app_compiled.js](https://github.com/cherylz/ninegram/blob/master/app_compiled.js). The Babel setting I used is [this one](https://babeljs.io/repl/#?babili=false&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=Q&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=es2015%2Cenv&prettier=false&targets=&version=7.4.3&externalPlugins=). Search "// IE" in [index.html](https://github.com/cherylz/ninegram/blob/master/index.html) to see how it worked.
- [Autoprefixer CSS online](https://autoprefixer.github.io/) was used to add vendor prefixes to make CSS Grid Layout work in IE11. Search `-ms-grid` in [style.css](https://github.com/cherylz/ninegram/blob/master/style.css) to see how the magic happened.
- Separate CSS styles were created to display images properly since IE11 doesn't support `object-fit`. Search `objectFitSupported` in [app.js](https://github.com/cherylz/ninegram/blob/master/app.js) to see how it worked.

## Test Plan

Before diving into the actual coding, I developed a test plan to think through and make sure not only the best case scenarios were tested but also the edge cases. I conducted constant testings during development and after deployment of every new feature.

Cross browser testing:

- Test that the page looks good and works as expected in the latest versions of Chrome, Safari, and Firefox.
- Test that the polyfills of the browser features not supported by IE11 works in IE11. The features are `Promise`, `fetch`, `Element.prototype.matches`, `Element.prototype.closest`, and `NodeList.prototype.forEach`.
- Test that the compiled JavaScript file after compiling ES6 features such as arrow functions and template strings works in IE11.
- Test that the prefixes for CSS Grid Layout works in IE11.
- Test that the alternative design to display images looks good in IE11 with the absence of `object-fit`.

Main functionalities - happy path:

- Test that on page load, 9 images can be fetched from the API and rendered.
- Test that with a valid search term from the user and 9 images available from the API, the images can be fetched and rendered.
- Test that when the user clicks the load-more button, s/he will see the 'easter egg'.

Main functionalities - edge cases:

- Test that on page load, when less than 9 images can be fetched from the API, another API request will be made to get 9 images.
- Test that when a user search is performed but images can't be fetched/rendered due to bad responses/network errors/less than 9 images available, proper notice will be displayed to inform the user.
- Test that when the user provides an empty search term, no API request will be made.
- Test that when the user provides an invalid non-empty search term (i.e. duplicate input, input contains characters that are not letters or space, or length exceeded the maximum set by the API), proper notice will be displayed to inform the user.
- Test that when the user provides a search term that contains extra spaces before or after the actual term, the input will be cleaned.
- Test that once the 'easter egg' is shown to the user, s/he won't be able to see it again during the next page visits.

## Discussion

Trade-offs I have made:

- To save bandwidth and improve UX when the browser caches and renders the images for the lightbox view, I used the `srcset` and `sizes` attributes on the `img` element. This method assists the browser to detect the most appropriate image source based on screen resolution. However, the two attributes are [not supported by IE11](https://caniuse.com/#search=srcset). I decided to let IE11 use the image from `src` as a fallback since the performance difference is likely affordable to users (e.g. on a 320px width screen with a device pixel ratio of 2, IE consumes ~2.3MB on page load while Chrome needs ~1.3MB).
- I didn't minify the JavaScript and CSS files for deployment though the practice would reduce the file size and speed up the app. Considering that the app performance without minification is reasonably satisfactory, I made this trade-off to make the code easy to read by peers.

What I might do differently with additional time:

- Implement the lazy loading technique to defer loading the images that are not visible to the user. If it proves to save bytes on page load and deliver a better UX, I'll go with it.
- Try an IE friendly CSS framework to facilitate styling in IE11 and save time for developers who want to work on the app in the future.
- Find an integrated way to support IE11. The current approach described in [Technical Choices](https://github.com/cherylz/ninegram#technical-choices) could be fragmented.
- Evaluate the need of scaling the app and experiment with ways to improve scalability if needed.
- Make the app a PWA (progressive web app) so users can use it on the mobile's home screen but don't need to download an extra app. I've built a PWA with Create React App ([live demo](https://castalleys.com), [repo](https://github.com/cherylz/castalleys)). It could be interesting to try PWA technologies on vanilla JavaScript.

## In Case You Want to Know More

Code I'm Particularly Proud of:

- I'm happy with the code I wrote with attention to detail, quality and UX. For example, I used debouncing to handle `scroll` event, handled non 200-299 responses when using `fetch`, and used event delegation to handle `click` events.
- In particular, I'm proud of how I maintained a similar level of experience for IE11 users and how I delivered a good experience for modern browsers (yes, I also care about how the browser feels). Check _To support IE11_ in [Technical Choices](https://github.com/cherylz/ninegram#technical-choices) for elaboration.
- More importantly, I'm always looking for improvement. So if you have feedback on how to make the code better, I'd appreciate it.

Happy Scores by [Google Lighthouse](https://developers.google.com/web/tools/lighthouse/):

![Scores by Google Lighthouse](https://i.ibb.co/3dHB6G8/Scores-by-Google-Lighthouse.png)

Wireframe of Ninegram:

![Wireframe of Ninegram](https://i.ibb.co/N7d5DDn/wireframe.jpg)
