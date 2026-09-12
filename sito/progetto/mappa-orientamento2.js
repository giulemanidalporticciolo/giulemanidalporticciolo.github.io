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
   RIORDINA LE SCHEDE IN BASE ALLA POSIZIONE DEI MARKER
-------------------------------------------------- */

function sortCardsByMarkerPosition() {
    const cardsArray = Array.from(cards);

    cardsArray.sort((cardA, cardB) => {
        const markerA = document.querySelector(
            `.map-marker[data-place="${cardA.dataset.place}"]`
        );

        const markerB = document.querySelector(
            `.map-marker[data-place="${cardB.dataset.place}"]`
        );

        if (!markerA || !markerB) return 0;

        const xA = markerA.offsetLeft;
        const xB = markerB.offsetLeft;

        if (xA !== xB) {
            return xA - xB;
        }

        return markerA.offsetTop - markerB.offsetTop;
    });

    cardsArray.forEach(card => {
        infoTrack.appendChild(card);
    });
}

sortCardsByMarkerPosition();


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
   ATTIVA MARKER CORRISPONDENTE ALLA SCHEDA
-------------------------------------------------- */

let lastActivatedCard = null;

function activateMarkerForCard(card) {
    if (!card) return;

    const key = card.dataset.place;

    if (!key) return;

    const marker = document.querySelector(
        `.map-marker[data-place="${key}"]`
    );

    if (!marker) return;

    if (lastActivatedCard === card) return;

    lastActivatedCard = card;

    markers.forEach(item => {
        item.classList.remove("active");
    });

    marker.classList.add("active");
}


/* --------------------------------------------------
   RILEVA LA SCHEDA CHE HA SUPERATO LA METÀ
-------------------------------------------------- */

function updateMarkerDuringCardScroll() {
    const currentScroll = infoTrack.scrollLeft;
    const viewportCenter =
        currentScroll + (infoTrack.clientWidth / 2);

    let currentCard = null;
    let nearestDistance = Infinity;

    cards.forEach(card => {
        const cardCenter =
            card.offsetLeft + (card.offsetWidth / 2);

        const distance =
            Math.abs(cardCenter - viewportCenter);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            currentCard = card;
        }
    });

    if (currentCard) {
        activateMarkerForCard(currentCard);
    }
}

infoTrack.addEventListener(
    "scroll",
    updateMarkerDuringCardScroll
);


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

    lastActivatedCard = card;


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
   SCHEDA ATTUALMENTE VISIBILE
-------------------------------------------------- */

function getCurrentCard() {
    if (!cards.length) return null;

    const currentScroll =
        infoTrack.scrollLeft;

    let currentCard = cards[0];
    let nearestDistance = Infinity;

    cards.forEach(card => {
        const distance =
            Math.abs(card.offsetLeft - currentScroll);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            currentCard = card;
        }
    });

    return currentCard;
}


/* --------------------------------------------------
   FRECCE SCHEDE
-------------------------------------------------- */

const navButtons =
    document.querySelectorAll(".map-info-nav");

navButtons.forEach(button => {
    button.addEventListener("click", event => {
        event.stopPropagation();

        const currentCard =
            getCurrentCard();

        if (!currentCard) return;

        const cardIndex =
            Array.from(infoTrack.children)
                .indexOf(currentCard);

        if (cardIndex === -1) return;

        const totalCards =
            infoTrack.children.length;

        const direction =
            button.classList.contains("map-info-prev")
                ? "prev"
                : "next";

        let nextIndex;

        if (direction === "next") {
            nextIndex =
                (cardIndex + 1) % totalCards;
        } else {
            nextIndex =
                (cardIndex - 1 + totalCards) % totalCards;
        }

        const nextCard =
            infoTrack.children[nextIndex];

        if (!nextCard) return;

        infoTrack.scrollTo({
            left: nextCard.offsetLeft,
            behavior: "smooth"
        });
    });
});
