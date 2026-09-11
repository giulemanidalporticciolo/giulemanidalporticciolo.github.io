const container = document.getElementById("map-container");

const basePath = container.dataset.basePath;

const info = document.getElementById("map-info");
const infoImage = document.getElementById("map-info-image");
const infoTitle = document.getElementById("map-info-title");
const infoDescription = document.getElementById("map-info-description");
const infoClose = document.getElementById("map-info-close");

const markers = document.querySelectorAll(".map-marker");

let mapHasScrolled = false;


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
