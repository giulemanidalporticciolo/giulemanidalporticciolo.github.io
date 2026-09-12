const info =
    document.getElementById("map-info");

const infoImage =
    document.getElementById("map-info-image");

const infoTitle =
    document.getElementById("map-info-title");

const infoDescription =
    document.getElementById("map-info-description");

const infoPrev =
    document.getElementById("map-info-prev");

const infoNext =
    document.getElementById("map-info-next");

const markers =
    document.querySelectorAll(".map-marker");

const mapContainer =
    document.getElementById("map-container");

const mapCanvas =
    document.getElementById("map-canvas");

const mapPanCue =
    document.getElementById("map-pan-cue");


/*
 * SCALA DELLA MAPPA
 *
 * data-map-scale="1"
 * = mappa a dimensione normale
 *
 * data-map-scale="1.8"
 * = mappa larga 180%
 */

const mapScale =
    parseFloat(
        mapContainer.dataset.mapScale
    ) || 1;

mapCanvas.style.width =
    `${mapScale * 100}%`;

mapCanvas.style.minWidth =
    `${mapScale * 100}%`;


/*
 * DATI DEI LUOGHI
 */

const places =
    JSON.parse(
        document.getElementById("map-places").textContent
    );


/*
 * ORDINE DEI MARKER
 *
 * Determinato dalla posizione orizzontale
 * dei marker nella mappa.
 */

const markerOrder =
    Array.from(markers).sort((a, b) => {

        return (
            parseFloat(getComputedStyle(a).left) -
            parseFloat(getComputedStyle(b).left)
        );

    });

let currentMarker = null;


/*
 * CUE PANORAMICO
 *
 * Il cue compare solo se la mappa
 * è realmente scrollabile e si trova
 * all'inizio.
 */

let mapPanCueShown = false;

function updateMapPanCue() {

    if (mapPanCueShown) {

        mapPanCue.classList.remove("visible");

        return;

    }

    const isScrollable =
        mapContainer.scrollWidth >
        mapContainer.clientWidth + 1;

    const isAtStart =
        mapContainer.scrollLeft <= 1;

    if (
        isScrollable &&
        isAtStart
    ) {

        mapPanCue.classList.add("visible");

    } else {

        mapPanCue.classList.remove("visible");

    }

}

mapContainer.addEventListener("scroll", () => {

    if (mapContainer.scrollLeft > 1) {

        mapPanCueShown = true;

        mapPanCue.classList.remove("visible");

    }

});

window.addEventListener(
    "resize",
    updateMapPanCue
);


/*
 * Aspetta che l'immagine abbia
 * determinato le dimensioni reali.
 */

const mapImage =
    mapCanvas.querySelector("img");

if (mapImage) {

    if (mapImage.complete) {

        updateMapPanCue();

    } else {

        mapImage.addEventListener(
            "load",
            updateMapPanCue
        );

    }

} else {

    updateMapPanCue();

}


/*
 * MOSTRA LUOGO
 */

function showPlace(marker, shouldScrollPage = true) {

    const key =
        marker.dataset.place;

    const place =
        places[key];

    if (!place) {
        return;
    }

    currentMarker = marker;

    mapPanCueShown = true;

    mapPanCue.classList.remove("visible");

    markers.forEach(item => {

        item.classList.remove("active");

    });

    marker.classList.add("active");

    infoImage.src =
        place.image;

    infoImage.alt =
        place.title;

    infoTitle.textContent =
        place.title;

    infoDescription.textContent =
        place.description;

    info.classList.add("visible");


    /*
     * Porta il marker al centro della mappa.
     */

    const markerLeft =
        marker.offsetLeft;

    const targetScroll =
        markerLeft -
        (mapContainer.clientWidth / 2);

    mapContainer.scrollTo({

        left: Math.max(0, targetScroll),

        behavior: "smooth"

    });


    /*
     * Porta la mappa nella stessa posizione,
     * leggermente sotto il bordo superiore dello schermo.
     */

    if (shouldScrollPage) {

        setTimeout(() => {

            const mapTop =
                mapContainer.getBoundingClientRect().top +
                window.scrollY;

            window.scrollTo({

                top: mapTop - 20,

                behavior: "smooth"

            });

        }, 50);

    }

}


/*
 * MARKER
 */

markers.forEach(marker => {

    marker.addEventListener("click", event => {

        event.stopPropagation();

        showPlace(marker);

    });

});


/*
 * PRECEDENTE — LOOP
 */

infoPrev.addEventListener("click", () => {

    if (!currentMarker) {
        return;
    }

    const position =
        markerOrder.indexOf(currentMarker);

    const previousPosition =
        position <= 0
            ? markerOrder.length - 1
            : position - 1;

    showPlace(
        markerOrder[previousPosition],
        false
    );

});


/*
 * SUCCESSIVO — LOOP
 */

infoNext.addEventListener("click", () => {

    if (!currentMarker) {
        return;
    }

    const position =
        markerOrder.indexOf(currentMarker);

    const nextPosition =
        position >= markerOrder.length - 1
            ? 0
            : position + 1;

    showPlace(
        markerOrder[nextPosition],
        false
    );

});
