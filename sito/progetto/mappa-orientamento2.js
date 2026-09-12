const mapContainer = document.getElementById("map-container");
const mapCanvas = document.getElementById("map-canvas");
const mapPanCue = document.getElementById("map-pan-cue");
const info = document.getElementById("map-info");
const infoTrack = document.getElementById("map-info-track");
const markers = document.querySelectorAll(".map-marker");
const cards = document.querySelectorAll(".map-info-card");

const mapScale = parseFloat(mapContainer.dataset.mapScale) || 1;

mapCanvas.style.width = `${mapScale * 100}%`;
mapCanvas.style.minWidth = `${mapScale * 100}%`;


/* --------------------------------------------------
   CUE PAN MAPPA
-------------------------------------------------- */

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

    if (isScrollable && isAtStart) {
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

window.addEventListener("resize", updateMapPanCue);

const mapImage = mapCanvas.querySelector("img");

if (mapImage) {
    if (mapImage.complete) {
        updateMapPanCue();
    } else {
        mapImage.addEventListener("load", updateMapPanCue);
    }
} else {
    updateMapPanCue();
}


/* --------------------------------------------------
   MOSTRA LUOGO
-------------------------------------------------- */

function showPlace(marker, shouldScrollPage = true) {
    const key = marker.dataset.place;

    const card = document.querySelector(
        `.map-info-card[data-place="${key}"]`
    );

    if (!card) return;

    const infoWasVisible =
        info.classList.contains("visible");


    /* --------------------------------------------------
       MARKER ATTIVO
    -------------------------------------------------- */

    markers.forEach(item => {
        item.classList.remove("active");
    });

    marker.classList.add("active");


    /* --------------------------------------------------
       CUE
    -------------------------------------------------- */

    mapPanCueShown = true;
    mapPanCue.classList.remove("visible");


    /* --------------------------------------------------
       AREA SCHEDE
    -------------------------------------------------- */

    info.classList.add("visible");

    if (!infoWasVisible) {
        infoTrack.scrollLeft = card.offsetLeft;
    } else {
        infoTrack.scrollTo({
            left: card.offsetLeft,
            behavior: "smooth"
        });
    }


    /* --------------------------------------------------
       MAPPA
    -------------------------------------------------- */

    const markerLeft = marker.offsetLeft;

    const targetMapScroll =
        markerLeft -
        (mapContainer.clientWidth / 2);

    mapContainer.scrollLeft =
        Math.max(0, targetMapScroll);


    /* --------------------------------------------------
       PAGINA
    -------------------------------------------------- */

    if (shouldScrollPage) {
        setTimeout(() => {
            const mapRect =
                mapContainer.getBoundingClientRect();

            const infoRect =
                info.getBoundingClientRect();

            const viewportHeight =
                window.innerHeight;

            const blockTop =
                Math.min(
                    mapRect.top,
                    infoRect.top
                );

            const blockBottom =
                Math.max(
                    mapRect.bottom,
                    infoRect.bottom
                );

            const blockHeight =
                blockBottom - blockTop;

            const isFullyVisible =
                blockTop >= 0 &&
                blockBottom <= viewportHeight;

            if (!isFullyVisible) {
                const targetPageScroll =
                    blockTop +
                    window.scrollY -
                    ((viewportHeight - blockHeight) / 2);

                window.scrollTo({
                    top: Math.max(0, targetPageScroll),
                    behavior: "smooth"
                });
            }
        }, 100);
    }
}


/* --------------------------------------------------
   MARKER
-------------------------------------------------- */

markers.forEach(marker => {
    marker.addEventListener("click", event => {
        event.stopPropagation();

        showPlace(marker);
    });
});


/* --------------------------------------------------
   CALCOLO MARKER PIÙ VICINO
-------------------------------------------------- */

function getNearestMarker(currentMarker, direction) {
    const currentX = currentMarker.offsetLeft;
    const currentY = currentMarker.offsetTop;

    let nearestMarker = null;
    let nearestDistance = Infinity;

    markers.forEach(marker => {
        if (marker === currentMarker) return;

        const markerX = marker.offsetLeft;
        const markerY = marker.offsetTop;

        const dx = markerX - currentX;
        const dy = markerY - currentY;

        /*
         * Per PREV consideriamo i marker a sinistra.
         * Per NEXT quelli a destra.
         *
         * La distanza viene comunque calcolata
         * realmente in 2D, quindi un marker leggermente
         * più in alto/basso ma molto vicino viene preferito
         * a uno molto più distante.
         */

        if (direction === "next" && dx <= 0) return;
        if (direction === "prev" && dx >= 0) return;

        const distance =
            Math.sqrt(
                (dx * dx) +
                (dy * dy)
            );

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestMarker = marker;
        }
    });

    /*
     * Se non c'è nessun marker nella direzione richiesta,
     * ricominciamo dall'altro lato.
     */

    if (!nearestMarker) {
        markers.forEach(marker => {
            if (marker === currentMarker) return;

            const markerX = marker.offsetLeft;
            const markerY = marker.offsetTop;

            const dx = markerX - currentX;
            const dy = markerY - currentY;

            const distance =
                Math.sqrt(
                    (dx * dx) +
                    (dy * dy)
                );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestMarker = marker;
            }
        });
    }

    return nearestMarker;
}


/* --------------------------------------------------
   FRECCE SCHEDE
-------------------------------------------------- */

const navButtons =
    document.querySelectorAll(".map-info-nav");

navButtons.forEach(button => {
    button.addEventListener("click", event => {
        event.stopPropagation();

        const card =
            button.closest(".map-info-card");

        if (!card) return;

        const currentMarker =
            document.querySelector(
                `.map-marker[data-place="${card.dataset.place}"]`
            );

        if (!currentMarker) return;

        const direction =
            button.classList.contains("map-info-prev")
                ? "prev"
                : "next";

        const nextMarker =
            getNearestMarker(
                currentMarker,
                direction
            );

        if (!nextMarker) return;

        showPlace(nextMarker, false);
    });
});
