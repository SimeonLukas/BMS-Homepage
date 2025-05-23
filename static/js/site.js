HTMLCollection.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.forEach = Array.prototype.forEach;


"use strict";

function debounce(func, wait) {
  var timeout;

  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);

    timeout = setTimeout(function () {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

function makeTeaser(body, terms) {
  var TERM_WEIGHT = 40;
  var NORMAL_WORD_WEIGHT = 2;
  var FIRST_WORD_WEIGHT = 8;
  var TEASER_MAX_WORDS = 10;

  var stemmedTerms = terms.map(function (w) {
    return elasticlunr.stemmer(w.toLowerCase());
  });
  var termFound = false;
  var index = 0;
  var weighted = [];

  var sentences = body.toLowerCase().split(". ");

  for (var i in sentences) {
    var words = sentences[i].split(" ");
    var value = FIRST_WORD_WEIGHT;

    for (var j in words) {
      var word = words[j];

      if (word.length > 0) {
        for (var k in stemmedTerms) {
          if (elasticlunr.stemmer(word).startsWith(stemmedTerms[k])) {
            value = TERM_WEIGHT;
            termFound = true;
          }
        }
        weighted.push([word, value, index]);
        value = NORMAL_WORD_WEIGHT;
      }

      index += word.length;
      index += 1;
    }

    index += 1;
  }

  if (weighted.length === 0) {
    return body;
  }

  var windowWeights = [];
  var windowSize = Math.min(weighted.length, TEASER_MAX_WORDS);

  var curSum = 0;
  for (var i = 0; i < windowSize; i++) {
    curSum += weighted[i][1];
  }
  windowWeights.push(curSum);

  for (var i = 0; i < weighted.length - windowSize; i++) {
    curSum -= weighted[i][1];
    curSum += weighted[i + windowSize][1];
    windowWeights.push(curSum);
  }

  var maxSumIndex = 0;
  if (termFound) {
    var maxFound = 0;
    for (var i = windowWeights.length - 1; i >= 0; i--) {
      if (windowWeights[i] > maxFound) {
        maxFound = windowWeights[i];
        maxSumIndex = i;
      }
    }
  }

  var teaser = [];
  var startIndex = weighted[maxSumIndex][2];
  for (var i = maxSumIndex; i < maxSumIndex + windowSize; i++) {
    var word = weighted[i];
    if (startIndex < word[2]) {
      teaser.push(body.substring(startIndex, word[2]));
      startIndex = word[2];
    }

    if (word[1] === TERM_WEIGHT) {
      teaser.push("<b>");
    }
    startIndex = word[2] + word[0].length;
    teaser.push(body.substring(word[2], startIndex));

    if (word[1] === TERM_WEIGHT) {
      teaser.push("</b>");
    }
  }
  teaser.push("…");
  return teaser.join("");
}

function formatSearchResultItem(item, terms) {
  return (
    `<article class='box'>` +
    `<h1 class='title'>` +
    `<a class='link' class='link' href='${item.ref}'>${item.doc.title}</a>` +
    `</h1>` +
    `<div class='content mt-2'>` +
    `${makeTeaser(item.doc.body, terms)}` +
    `<a href='${item.ref}'>` +
    `Weiterlesen <span class="icon is-small"><i class="fas fa-arrow-right fa-xs"></i></span>` +
    `</a>` +
    `</div>` +
    `</article>`
  );
}

function search() {
  var $searchInput = document.getElementById("search");
  var $searchResults = document.querySelector(".search-results");
  var $searchResultsItems = document.querySelector(".search-results__items");
  var MAX_ITEMS = 10;

  var options = {
    bool: "AND",
    fields: {
      title: {
        boost: 2
      },
      body: {
        boost: 1
      },
    },
  };
  var currentTerm = "";
  var index = elasticlunr.Index.load(window.searchIndex);

  $searchInput.addEventListener(
    "keyup",
    debounce(function () {
      var term = $searchInput.value.trim();
      if (term === currentTerm || !index) {
        return;
      }
      $searchResults.style.display = term === "" ? "none" : "block";
      $searchResultsItems.innerHTML = "";
      if (term === "") {
        return;
      }

      var results = index.search(term, options);
      if (results.length === 0) {
        $searchResults.style.display = "none";
        return;
      }

      currentTerm = term;
      for (var i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
        var item = document.createElement("div");
        item.classList.add("mb-4");
        item.innerHTML = formatSearchResultItem(results[i], term.split(" "));
        $searchResultsItems.appendChild(item);
      }
    }, 150)
  );
}

function documentReadyCallback() {

  if (localStorage.getItem("theme") === "dark") {
    document.body.setAttribute("theme", "dark");
    document.querySelectorAll("img, picture, video, pre, .sl-image").forEach(img => img.setAttribute("theme", "dark"));
    document.querySelectorAll(".vimeo, .youtube, .chart").forEach(video => video.setAttribute("theme", "dark"));
    // document.getElementById("dark-mode").setAttribute("title", "Licht an");
  }

  document.querySelector(".navbar-burger").addEventListener("click", () => {
    document.querySelector(".navbar-burger").classList.toggle("is-active");
    document.querySelector(".navbar-menu").classList.toggle("is-active");
  });

  document.querySelectorAll("div.navbar-end > .navbar-item").forEach((el) => {
    if (location.href.includes(el.getAttribute("href"))) {
      document.querySelectorAll("a.navbar-item.is-active").forEach(itm => itm.classList.remove("is-active"));
      el.classList.add("is-active");
    }
  })

  document.getElementById("nav-search").addEventListener("click", (evt) => {
    //let target = evt.currentTarget.getAttribute("data-target");
    document.querySelector("html").classList.add("is-clipped");
    document.getElementById("search-modal").classList.add("is-active");

    document.getElementById("search").focus();
    document.getElementById("search").select();
  });

  document.querySelector(".modal-close").addEventListener("click", (evt) => {
    document.querySelector("html").classList.remove("is-clipped");
    evt.currentTarget.parentElement.classList.remove("is-active");
  });

  document.querySelector(".modal-background").addEventListener("click", (evt) => {
    document.querySelector("html").classList.remove("is-clipped");
    evt.currentTarget.parentElement.classList.remove("is-active");
  });

  document.getElementById("search").addEventListener("keyup", () => {
    search();
  });

  // document.getElementById("dark-mode").addEventListener("click", () => {
  //   if (
  //     localStorage.getItem("theme") == null ||
  //     localStorage.getItem("theme") == "light"
  //   ) {
  //     localStorage.setItem("theme", "dark");
  //     document.body.setAttribute("theme", "dark");
  //     document.querySelectorAll("img, picture, video, pre").forEach(img => img.setAttribute("theme", "dark"));
  //     document.querySelectorAll(".vimeo, .youtube, .chart").forEach(video => video.setAttribute("theme", "dark"));

  //     document.getElementById("dark-mode").setAttribute("title", "Licht an");
  //   } else {
  //     localStorage.setItem("theme", "light");
  //     document.body.removeAttribute("theme", "dark");
  //     document.querySelectorAll("img, picture, video, pre").forEach(img => img.removeAttribute("theme", "dark"))
  //     document.querySelectorAll(".vimeo, .youtube, .chart").forEach(video => video.removeAttribute("theme", "dark"));

  //     document.getElementById("dark-mode").setAttribute("title", "Licht aus");
  //   }
  // });

  if (typeof mermaid !== "undefined") {
    mermaid.initialize({
      startOnLoad: true
    });
  }

  if (typeof chartXkcd !== "undefined") {
    document.querySelectorAll(".chart").forEach((el, i) => {
      el.setAttribute("id", `chart-${i}`);

      let svg = document.getElementById(`chart-${i}`);
      let {
        type,
        ...chartData
      } = JSON.parse(el.textContent);
      new chartXkcd[type](svg, chartData);
    });
  }

  if (typeof Galleria !== "undefined") {
    document.querySelectorAll(".galleria").forEach((el, i) => {
      el.setAttribute("id", `galleria-${i}`);

      let {
        images
      } = JSON.parse(el.textContent);

      for (let image of images) {
        el.insertAdjacentHTML("beforeend",
          `<a href="${image.src}"><img src="${image.src}" data-title="${image.title}" data-description="${image.description}"></a>`
        );
      }

      Galleria.run(".galleria");
    });
  }

  if (typeof mapboxgl !== "undefined") {
    document.querySelectorAll(".map").forEach((el, i) => {
      el.setAttribute("id", `map-${i}`);

      mapboxgl.accessToken = el.querySelector(".mapbox-access-token").textContent.trim();
      let zoom = el.querySelector(".mapbox-zoom").textContent.trim();

      let map = new mapboxgl.Map({
        container: `map-${i}`,
        style: "mapbox://styles/mapbox/streets-v10",
        center: [-96, 37.8],
        zoom: zoom,
      });

      map.addControl(new mapboxgl.NavigationControl());

      let geojson = JSON.parse(el.querySelector(".mapbox-geojson").textContent.trim());

      const center = [0, 0];

      geojson.features.forEach(function (marker) {
        center[0] += marker.geometry.coordinates[0];
        center[1] += marker.geometry.coordinates[1];

        new mapboxgl.Marker({
            "color": "#62b32e"
          })
          .setLngLat(marker.geometry.coordinates)
          .setPopup(
            new mapboxgl.Popup({
              offset: 25
            }) // add popups
            .setHTML(
              "<h3>" +
              marker.properties.title +
              "</h3><p>" +
              marker.properties.description +
              "</p>"
            )
          )
          .addTo(map);
      });

      center[0] = center[0] / geojson.features.length;
      center[1] = center[1] / geojson.features.length;

      map.setCenter(center);
    });
  }

  if (typeof renderMathInElement !== "undefined") {
    renderMathInElement(document.body, {
      delimiters: [{
          left: '$$',
          right: '$$',
          display: true
        },
        {
          left: '$',
          right: '$',
          display: false
        },
        {
          left: '\\(',
          right: '\\)',
          display: false
        },
        {
          left: '\\[',
          right: '\\]',
          display: true
        }
      ]
    });
  }
};

if (document.readyState === 'loading') { // Loading hasn't finished yet
  document.addEventListener('DOMContentLoaded', documentReadyCallback);
} else { // `DOMContentLoaded` has already fired
  documentReadyCallback();
}


var lightbox = new SimpleLightbox('.gallery a', {
});



// Functions

function pieanimation(x, y, z) {
  let percentage = x / x;
  percentage = percentage * 100;
  console.log(percentage);
  let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 36 36');
  // add text
  let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '50%');
  text.setAttribute('y', '60%');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '12');
  text.setAttribute('fill', '#000');
  text.textContent = x;
  svg.appendChild(text);
  svg.setAttribute('class', 'circular-chart');
  let circle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  circle.setAttribute('class', z);
  circle.setAttribute('stroke-dasharray', +percentage + ', 100');
  circle.setAttribute('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831');
  svg.appendChild(circle);
  document.getElementById(y).innerHTML = "";
  document.getElementById(y).appendChild(svg);
}




function getarticles() {
  // fetch("/sitemap.xml")
  //   .then((response) => response.text())
  //   .then((data) => {
  //     // console.log(data);
  //     // pieanimation(data.split("</lastmod>").length - 3, "piechart1", "circle");

  //   });
    pieanimation(2, "piechart1", "circle")
  pieanimation(607, "piechart2", "circle1")
  pieanimation(62, "piechart3", "circle2")
}

function getcategories() {
  fetch("/categories/")
    .then((response) => response.text())
    .then((data) => {
      let number = data.split('class="mr-4"').length
      console.log(data.split('class="mr-4"').length);

      for (let i = 0; i < number; i++) {
        setTimeout(function timer() {
          document.getElementById("categoriesnumber").innerText = i
        }, i * 200);
      }


    });
}

function gettags() {
  fetch("/tags/")
    .then((response) => response.text())
    .then((data) => {
      let number = data.split('class="mr-4"').length
      console.log(data.split('class="mr-4"').length);

      for (let i = 0; i < number; i++) {
        setTimeout(function timer() {
          document.getElementById("tagsnumber").innerText = i
        }, i * 100);
      }

    });
}







const jadeScale = document.querySelectorAll("#tagsnumber");
var gotcatgories = 0;
var jadeScaleObserver = new IntersectionObserver(function (entries, observer) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting && gotcatgories != 1) {
      gettags();
      getcategories();
      gotcatgories = 1;
    } else {}
  });
});

jadeScale.forEach(function (jadeScale) {
  jadeScaleObserver.observe(jadeScale);
});


const pieanim = document.querySelectorAll("#piechart1");
const options = {
  rootMargin: "0px"
};
var gotarticles = 0;
var pieanimObserver = new IntersectionObserver(function (entries, observer) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting && gotarticles != 1) {
      getarticles();
      gotarticles = 1;

    } else {}
  });
}, options);

pieanim.forEach(function (pieanim) {
  pieanimObserver.observe(pieanim);
});


if (document.getElementById("teaser")){
  setInterval(function () {
    const content = document.getElementById("teaser").innerHTML;
    document.getElementById("teaser").innerHTML = content;
}, 25000);
}

let notifications = document.getElementsByClassName("notify");
console.log(notifications);
notifications.forEach(notification => {
let expire = new Date(notification.getAttribute("data-date")).getTime();
console.log(expire)
let now = new Date().getTime();
console.log(now)
if (now < expire){
  notification.style.display = "block";
}
});


function start(){
let containers = document.getElementsByClassName("container");
containers.forEach(container  => {
container.style.display = "block";

} )

document.getElementsByClassName("footer")[0].style.display = "block";
let articles = document.getElementsByTagName("article");
articles.forEach(article  => {
article.style.display = "block";

} )
document.getElementsByClassName("pagination")[0].style.display = "flex";
document.getElementsByClassName("lowhigh")[0].style.display = "block";
}


setTimeout(function(){
  start();
},800);

function checkUrl() {
  let url = window.location.href;
  let path = url.split("/");
  let lastPath = path[path.length - 2];
  console.log(lastPath);
  if (lastPath ==  "jugendsozialarbeit-an-schulen" ) {
    document.getElementById("jugendsozialarbeit").style.display = "block";
  }
}

setTimeout(function(){
  checkUrl();
},10);