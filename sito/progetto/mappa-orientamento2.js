const container = document.getElementById("map-container");
const canvas = document.getElementById("map-canvas");

const basePath = container.dataset.basePath;

const info = document.getElementById("map-info");
const infoImage = document.getElementById("map-info-image");
const infoTitle = document.getElementById("map-info-title");
const infoDescription = document.getElementById("map-info-description");
const infoClose = document.getElementById("map-info-close");

const markers = document.querySelectorAll(".map-marker");

const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const zoomReset = document.getElementById("zoom-reset");


const places = {

    isoletta: {
        title: "Bar Isoletta",
        image: basePath + "bar-isoletta.jpg",
        description:
            "Bar Isoletta si trova nelle immediate vicinanze dell'area interessata dal progetto."
    },

    waqas: {
        title: "Waqas Kebab",
        image: basePath + "waqas-kebab.jpg",
        description:
            "Waqas Kebab è uno dei punti di riferimento presenti lungo il tratto di quartiere interessato."
    },

    hotel: {
        title: "Hotel Polo Nautico",
        image: basePath + "hotel-polo-nautico.jpg",
        description:
            "L'Hotel Polo Nautico si trova in prossimità dell'area del progetto."
    },

    "quo-vadis": {
        title: "Pizzeria Quo Vadis",
        image: basePath + "pizzeria-quo-vadis.jpg",
        description:
            "La Pizzeria Quo Vadis è un altro punto di riferimento utile per orientarsi rispetto all'area del progetto."
    },

    piazzetta: {
        title: "Piazzetta del Porticciolo",
        image: basePath + "piazzetta-porticciolo.jpg",
        description:
            "La Piazzetta del Porticciolo è uno degli spazi direttamente interessati dalla trasformazione prevista dal progetto."
    },

    spiaggetta: {
        title: "Spiaggetta del Porticciolo",
        image: basePath + "spiaggetta-porticciolo.jpg",
        description:
            "La Spiaggetta del Porticciolo è uno degli spazi direttamente interessati dalla trasformazione prevista dal progetto."
    }

};


let scale = 1;

let offsetX = 0;
let offsetY = 0;

let pointers = new Map();

let dragStartX = 0;
let dragStartY = 0;

let startOffsetX = 0;
let startOffsetY = 0;

let pinchStartDistance = null;
let pinchStartScale = 1;

let pinchCenterX = 0;
let pinchCenterY = 0;

let mapHasScrolled = false;


const MIN_SCALE = 1;
const MAX_SCALE = 3;


function updateMap() {

    canvas.style.transform =
        `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

}


function getDistance(pointer1, pointer2) {

    const dx =
        pointer1.clientX - pointer2.clientX;

    const dy =
        pointer1.clientY - pointer2.clientY;

    return Math.sqrt(
        dx * dx + dy * dy
    );

}


function getCenter(pointer1, pointer2) {

    return {

        x:
            (pointer1.clientX + pointer2.clientX) / 2,

        y:
            (pointer1.clientY + pointer2.clientY) / 2

    };

}


function zoomTo(newScale, clientX, clientY) {

    const oldScale = scale;

    scale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, newScale)
    );


    if (
        clientX !== undefined &&
        clientY !== undefined &&
        oldScale !== scale
    ) {

        const rect =
            container.getBoundingClientRect();

        const x =
            clientX - rect.left;

        const y =
            clientY - rect.top;


        offsetX =
            x - (x - offsetX) * (scale / oldScale);

        offsetY =
            y - (y - offsetY) * (scale / oldScale);

    }


    updateMap();

}


function resetMap() {

    scale = 1;

    offsetX = 0;
    offsetY = 0;

    updateMap();

}


zoomIn.addEventListener("click", () => {

    zoomTo(scale + 0.25);

});


zoomOut.addEventListener("click", () => {

    zoomTo(scale - 0.25);

});


zoomReset.addEventListener("click", resetMap);


container.addEventListener("wheel", event => {

    event.preventDefault();

    zoomTo(
        scale + (event.deltaY < 0 ? 0.2 : -0.2),
        event.clientX,
        event.clientY
    );

}, { passive: false });


container.addEventListener("pointerdown", event => {

    if (
        event.target.closest(".map-marker") ||
        event.target.closest(".map-controls")
    ) {
        return;
    }


    pointers.set(event.pointerId, event);


    if (pointers.size === 1) {

        dragStartX = event.clientX;
        dragStartY = event.clientY;

        startOffsetX = offsetX;
        startOffsetY = offsetY;

        container.setPointerCapture(event.pointerId);

    }


    if (pointers.size === 2) {

        const activePointers =
            Array.from(pointers.values());

        const pointer1 = activePointers[0];
        const pointer2 = activePointers[1];


        pinchStartDistance =
            getDistance(pointer1, pointer2);

        pinchStartScale = scale;


        const center =
            getCenter(pointer1, pointer2);


        const rect =
            container.getBoundingClientRect();


        pinchCenterX =
            center.x - rect.left;

        pinchCenterY =
            center.y - rect.top;

    }

});


container.addEventListener("pointermove", event => {

    if (!pointers.has(event.pointerId)) {
        return;
    }


    pointers.set(event.pointerId, event);


    if (pointers.size === 1) {

        offsetX =
            startOffsetX +
            (event.clientX - dragStartX);

        offsetY =
            startOffsetY +
            (event.clientY - dragStartY);


        updateMap();

        return;
    }


    if (
        pointers.size === 2 &&
        pinchStartDistance !== null
    ) {

        const activePointers =
            Array.from(pointers.values());

        const pointer1 = activePointers[0];
        const pointer2 = activePointers[1];


        const currentDistance =
            getDistance(pointer1, pointer2);


        const newScale =
            pinchStartScale *
            (currentDistance / pinchStartDistance);


        const oldScale = scale;


        scale = Math.max(
            MIN_SCALE,
            Math.min(MAX_SCALE, newScale)
        );


        const center =
            getCenter(pointer1, pointer2);


        const rect =
            container.getBoundingClientRect();


        const centerX =
            center.x - rect.left;

        const centerY =
            center.y - rect.top;


        if (oldScale !== scale) {

            offsetX =
                centerX -
                (pinchCenterX - offsetX) *
                (scale / pinchStartScale);

            offsetY =
                centerY -
                (pinchCenterY - offsetY) *
                (scale / pinchStartScale);

        }


        updateMap();

    }

});


function removePointer(event) {

    pointers.delete(event.pointerId);


    if (
        container.hasPointerCapture(event.pointerId)
    ) {

        container.releasePointerCapture(
            event.pointerId
        );

    }


    if (pointers.size < 2) {

        pinchStartDistance = null;

    }


    if (pointers.size === 1) {

        const remainingPointer =
            Array.from(pointers.values())[0];


        dragStartX =
            remainingPointer.clientX;

        dragStartY =
            remainingPointer.clientY;

        startOffsetX = offsetX;
        startOffsetY = offsetY;

    }

}


container.addEventListener("pointerup", removePointer);

container.addEventListener("pointercancel", removePointer);

container.addEventListener("pointerleave", event => {

    if (
        event.pointerType === "mouse" &&
        pointers.has(event.pointerId)
    ) {

        removePointer(event);

    }

});


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


        if (!mapHasScrolled) {

            mapHasScrolled = true;


            setTimeout(() => {

                const infoTop =
                    info.getBoundingClientRect().top +
                    window.scrollY;


                window.scrollTo({

                    top: infoTop - 30,

                    behavior: "smooth"

                });

            }, 50);

        }

    });

});


infoClose.addEventListener("click", () => {

    info.classList.remove("visible");


    markers.forEach(marker => {

        marker.classList.remove("active");

    });

});
