const mapContainer =
    document.getElementById("map-container");

const mapCanvas =
    document.getElementById("map-canvas");

const mapPanCue =
    document.getElementById("map-pan-cue");

const info =
    document.getElementById("map-info");

const infoTrack =
    document.getElementById("map-info-track");

const markers =
    document.querySelectorAll(".map-marker");

const cards =
    document.querySelectorAll(".map-info-card");


/*
 * SCALA DELLA MAPPA
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
 * ORDINE DEI MARKER
 */

const markerOrder =
    Array.from(markers).sort((a, b) => {

        return (
            parseFloat(getComputedStyle(a).left) -
            parseFloat(getComputedStyle(b).left)
        );

    });


/*
 * MAPPA SCROLLABILE
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
 * SCHEDA
 */

function showPlace(marker, shouldScrollPage = true) {

    const key =
        marker.dataset.place;

    const card =
        document.querySelector(
            `.map-info-card[data-place="${key}"]`
        );

    if (!card) {
        return;
    }

    /*
     * Evidenzia marker.
     */

    markers.forEach(item => {

        item.classList.remove("active");

    });

    marker.classList.add("active");

    mapPanCueShown = true;

    mapPanCue.classList.remove("visible");


    /*
     * Mostra il blocco delle schede.
     */

    info.classList.add("visible");


    /*
     * Porta la scheda selezionata
     * nella posizione visibile.
     */

    infoTrack.scrollTo({

        left: card.offsetLeft,

        behavior: "smooth"

    });


    /*
     * Porta anche il marker al centro
     * della mappa.
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
     * leggermente sotto il bordo superiore.
     */

    if (shouldScrollPage) {

        setTimeout(() => {

            const mapTop =
                mapContainer.getBoundingClientRect().top +
                window.scrollY;

            window.scrollTo({

                top: mapTop - 80,

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
 * FRECCE
 */

const navButtons =
    document.querySelectorAll(".map-info-nav");

navButtons.forEach(button => {

    button.addEventListener("click", event => {

        event.stopPropagation();

        const card =
            button.closest(".map-info-card");

        if (!card) {
            return;
        }

        const currentIndex =
            Array.from(cards).indexOf(card);

        let nextIndex;

        if (
            button.classList.contains("map-info-prev")
        ) {

            nextIndex =
                currentIndex <= 0
                    ? cards.length - 1
                    : currentIndex - 1;

        } else {

            nextIndex =
                currentIndex >= cards.length - 1
                    ? 0
                    : currentIndex + 1;

        }

        const nextCard =
            cards[nextIndex];

        const marker =
            document.querySelector(
                `.map-marker[data-place="${nextCard.dataset.place}"]`
            );

        if (!marker) {
            return;
        }

        showPlace(marker, false);

    });

});
