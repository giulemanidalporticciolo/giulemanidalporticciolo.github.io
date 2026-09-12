const info =
    document.getElementById("map-info");

const infoImage =
    document.getElementById("map-info-image");

const infoTitle =
    document.getElementById("map-info-title");

const infoDescription =
    document.getElementById("map-info-description");

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
 * CUE PANORAMICO
 */

function updateMapPanCue() {

    const isScrollable =
        mapContainer.scrollWidth >
        mapContainer.clientWidth;

    const isAtStart =
        mapContainer.scrollLeft <= 1;

    if (isScrollable && isAtStart) {
        mapPanCue.classList.add("visible");
    } else {
        mapPanCue.classList.remove("visible");
    }

}

mapContainer.addEventListener(
    "scroll",
    updateMapPanCue
);

window.addEventListener(
    "resize",
    updateMapPanCue
);

updateMapPanCue();


/*
 * MARKER
 */

markers.forEach(marker => {

    marker.addEventListener("click", event => {

        event.stopPropagation();


        const place =
            places[marker.dataset.place];


        if (!place) {
            return;
        }


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
         * Porta sempre la mappa nella stessa posizione,
         * leggermente sotto il bordo superiore dello schermo.
         */

        setTimeout(() => {

            const mapTop =
                mapContainer.getBoundingClientRect().top +
                window.scrollY;


            window.scrollTo({

                top: mapTop - 30,

                behavior: "smooth"

            });

        }, 50);

    });

});
