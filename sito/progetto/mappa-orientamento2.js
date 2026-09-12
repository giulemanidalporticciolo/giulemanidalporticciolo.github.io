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

const mapPanCue =
    document.getElementById("map-pan-cue");


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
 */

let mapPanCueShown = false;

function updateMapPanCue() {

    const isScrollable =
        mapContainer.scrollWidth >
        mapContainer.clientWidth;

    const isAtStart =
        mapContainer.scrollLeft <= 1;

    if (
        isScrollable &&
        isAtStart &&
        !mapPanCueShown
    ) {
        mapPanCue.classList.add("visible");
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

updateMapPanCue();


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
     * Aggiorna le frecce.
     */

    const position =
        markerOrder.indexOf(marker);

    infoPrev.disabled =
        position <= 0;

    infoNext.disabled =
        position >= markerOrder.length - 1;


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

                top: mapTop - 30,

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
 * PRECEDENTE
 */

infoPrev.addEventListener("click", () => {

    if (!currentMarker) {
        return;
    }

    const position =
        markerOrder.indexOf(currentMarker);

    if (position <= 0) {
        return;
    }

    showPlace(
        markerOrder[position - 1],
        false
    );

});
 

/*
 * SUCCESSIVO
 */

infoNext.addEventListener("click", () => {

    if (!currentMarker) {
        return;
    }

    const position =
        markerOrder.indexOf(currentMarker);

    if (
        position === -1 ||
        position >= markerOrder.length - 1
    ) {
        return;
    }

    showPlace(
        markerOrder[position + 1],
        false
    );

});
