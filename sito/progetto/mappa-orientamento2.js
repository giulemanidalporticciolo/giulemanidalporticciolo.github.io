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
   CUE PAN
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

    markers.forEach(item => {
        item.classList.remove("active");
    });

    marker.classList.add("active");

    mapPanCueShown = true;
    mapPanCue.classList.remove("visible");

    info.classList.add("visible");


    /* Scorri la scheda */
    infoTrack.scrollTo({
        left: card.offsetLeft,
        behavior: "smooth"
    });


    /* Centra il marker nella mappa */
    const markerLeft = marker.offsetLeft;

    const targetScroll =
        markerLeft -
        (mapContainer.clientWidth / 2);

    mapContainer.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth"
    });


    /* Centra verticalmente mappa + scheda
       solo se il blocco non è già completamente visibile */
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
                const targetTop =
                    blockTop +
                    window.scrollY -
                    ((viewportHeight - blockHeight) / 2);

                window.scrollTo({
                    top: Math.max(0, targetTop),
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

        const currentIndex =
            Array.from(cards).indexOf(card);

        let nextIndex;

        if (button.classList.contains("map-info-prev")) {
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

        const nextCard = cards[nextIndex];

        const marker = document.querySelector(
            `.map-marker[data-place="${nextCard.dataset.place}"]`
        );

        if (!marker) return;

        showPlace(marker, false);
    });
});
