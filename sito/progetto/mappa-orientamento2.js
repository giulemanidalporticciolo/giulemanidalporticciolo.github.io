const container = document.getElementById("map-container");
const canvas = document.getElementById("map-canvas");

const basePath = container.dataset.basePath;

const info = document.getElementById("map-info");
const infoImage = document.getElementById("map-info-image");
const infoTitle = document.getElementById("map-info-title");
const infoDescription = document.getElementById("map-info-description");
const infoClose = document.getElementById("map-info-close");

const markers = document.querySelectorAll(".map-marker");


const places = {

    isoletta: {
        title: "Bar Isoletta",
        image: basePath + "bar-isoletta.jpg",
        description: "Bar Isoletta si trova nelle immediate vicinanze dell'area interessata dal progetto."
    },

    waqas: {
        title: "Waqas Kebab",
        image: basePath + "waqas-kebab.jpg",
        description: "Waqas Kebab è uno dei punti di riferimento presenti lungo il tratto di quartiere interessato."
    },

    hotel: {
        title: "Hotel Polo Nautico",
        image: basePath + "hotel-polo-nautico.jpg",
        description: "L'Hotel Polo Nautico si trova in prossimità dell'area del progetto."
    },

    "quo-vadis": {
        title: "Pizzeria Quo Vadis",
        image: basePath + "pizzeria-quo-vadis.jpg",
        description: "La Pizzeria Quo Vadis è un altro punto di riferimento utile per orientarsi rispetto all'area del progetto."
    },

    piazzetta: {
        title: "Piazzetta del Porticciolo",
        image: basePath + "piazzetta-porticciolo.jpg",
        description: "La Piazzetta del Porticciolo è uno degli spazi direttamente interessati dalla trasformazione prevista dal progetto."
    },

    spiaggetta: {
        title: "Spiaggetta del Porticciolo",
        image: basePath + "spiaggetta-porticciolo.jpg",
        description: "La Spiaggetta del Porticciolo è uno degli spazi direttamente interessati dalla trasformazione prevista dal progetto."
    }

};


let offsetX = 0;

let activePointers = 0;
let dragging = false;

let dragStartX = 0;
let startOffsetX = 0;

let multiTouchDetected = false;

let bounceAnimation = null;

let mapHasScrolled = false;


const BOUNCE_DISTANCE = 45;


/* LIMITI DEL PAN */

function getLimits() {

    const containerWidth = container.clientWidth;
    const canvasWidth = canvas.offsetWidth;

    const maxLeft = 0;

    const maxRight = Math.min(
        0,
        containerWidth - canvasWidth
    );

    return {
        min: maxRight,
        max: maxLeft
    };

}


/* POSIZIONE DELLA MAPPA */

function setOffset(newOffset) {

    const limits = getLimits();

    offsetX = Math.max(
        limits.min,
        Math.min(limits.max, newOffset)
    );

    canvas.style.transform =
        `translateX(${offsetX}px)`;

}


/* POSIZIONE CON RESISTENZA AI BORDI */

function setOffsetWithResistance(newOffset) {

    const limits = getLimits();

    if (newOffset > limits.max) {

        const overscroll =
            newOffset - limits.max;

        offsetX =
            limits.max +
            Math.min(
                BOUNCE_DISTANCE,
                overscroll * 0.25
            );

    } else if (newOffset < limits.min) {

        const overscroll =
            limits.min - newOffset;

        offsetX =
            limits.min -
            Math.min(
                BOUNCE_DISTANCE,
                overscroll * 0.25
            );

    } else {

        offsetX = newOffset;

    }


    canvas.style.transform =
        `translateX(${offsetX}px)`;

}


/* RITORNO ELASTICO */

function bounceBack() {

    const limits = getLimits();

    let target = offsetX;


    if (offsetX > limits.max) {
        target = limits.max;
    }

    if (offsetX < limits.min) {
        target = limits.min;
    }


    if (target === offsetX) {
        return;
    }


    if (bounceAnimation) {
        cancelAnimationFrame(bounceAnimation);
    }


    const start = offsetX;
    const startTime = performance.now();
    const duration = 350;


    function animate(time) {

        const progress =
            Math.min(
                1,
                (time - startTime) / duration
            );


        /*
         * Curva ease-out elastica leggera.
         */

        const eased =
            1 - Math.pow(1 - progress, 3);


        offsetX =
            start +
            (target - start) * eased;


        canvas.style.transform =
            `translateX(${offsetX}px)`;


        if (progress < 1) {

            bounceAnimation =
                requestAnimationFrame(animate);

        } else {

            offsetX = target;

            canvas.style.transform =
                `translateX(${offsetX}px)`;

            bounceAnimation = null;

        }

    }


    bounceAnimation =
        requestAnimationFrame(animate);

}


/* RESET */

function resetMap() {

    if (bounceAnimation) {
        cancelAnimationFrame(bounceAnimation);
        bounceAnimation = null;
    }

    setOffset(0);

}


/* PAN CON POINTER EVENTS */

container.addEventListener("pointerdown", event => {

    if (event.target.closest(".map-marker")) {
        return;
    }


    activePointers++;


    /*
     * Due dita:
     * blocchiamo completamente il pan.
     */

    if (activePointers > 1) {

        dragging = false;
        multiTouchDetected = true;

        return;

    }


    if (multiTouchDetected) {

        dragging = false;

        return;

    }


    dragging = true;

    dragStartX = event.clientX;

    startOffsetX = offsetX;


    container.setPointerCapture(
        event.pointerId
    );

});


container.addEventListener("pointermove", event => {

    /*
     * Due dita = nessuna interazione.
     */

    if (
        activePointers !== 1 ||
        !dragging ||
        multiTouchDetected
    ) {
        return;
    }


    const movement =
        event.clientX - dragStartX;


    setOffsetWithResistance(
        startOffsetX + movement
    );

});


function endPointer(event) {

    activePointers =
        Math.max(
            0,
            activePointers - 1
        );


    if (
        dragging &&
        activePointers === 0
    ) {

        bounceBack();

    }


    dragging = false;


    if (
        container.hasPointerCapture(
            event.pointerId
        )
    ) {

        container.releasePointerCapture(
            event.pointerId
        );

    }


    if (activePointers === 0) {

        multiTouchDetected = false;

    }

}


container.addEventListener(
    "pointerup",
    endPointer
);


container.addEventListener(
    "pointercancel",
    endPointer
);


/* RIDIMENSIONAMENTO */

window.addEventListener("resize", () => {

    setOffset(offsetX);

});


/* MARKER */

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
         * Scroll automatico solo al primo click.
         */

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


/* CHIUDI POPUP */

infoClose.addEventListener("click", () => {

    info.classList.remove("visible");


    markers.forEach(marker => {

        marker.classList.remove("active");

    });

});


/* POSIZIONE INIZIALE */

resetMap();
