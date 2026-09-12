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

const placeKeys =
    Object.keys(places);

let currentIndex = -1;


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

function showPlace(index, shouldScrollPage = true) {

    if (index < 0 || index >= placeKeys.length) {
        return;
    }

    const key =
        placeKeys[index];

    const place =
        places[key];

    if (!place) {
        return;
    }

    currentIndex = index;

    mapPanCue.classList.remove("visible");

    markers.forEach(marker => {

        marker.classList.remove("active");

        if (marker.dataset.place === key) {
            marker.classList.add("active");
        }

    });

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

    const marker =
        document.querySelector(
            `.map-marker[data-place="${key}"]`
        );

    if (marker) {

        const markerLeft =
            marker.offsetLeft;

        const targetScroll =
            markerLeft -
            (mapContainer.clientWidth / 2);

        mapContainer.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: "smooth"
        });

    }


    /*
     * Porta la mappa nella stessa posizione
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

markers.forEach((marker, index) => {

    marker.addEventListener("click", event => {

        event.stopPropagation();

        const key =
            marker.dataset.place;

        const placeIndex =
            placeKeys.indexOf(key);

        if (placeIndex === -1) {
            return;
        }

        showPlace(placeIndex);

    });

});


/*
 * FRECCIA PRECEDENTE
 */

infoPrev.addEventListener("click", () => {

    if (currentIndex <= 0) {
        return;
    }

    showPlace(
        currentIndex - 1,
        false
    );

});


/*
 * FRECCIA SUCCESSIVA
 */

infoNext.addEventListener("click", () => {

    if (
        currentIndex === -1 ||
        currentIndex >= placeKeys.length - 1
    ) {
        return;
    }

    showPlace(
        currentIndex + 1,
        false
    );

});
