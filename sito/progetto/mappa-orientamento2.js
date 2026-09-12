const info = document.getElementById("map-info");

const infoImage =
    document.getElementById("map-info-image");

const infoTitle =
    document.getElementById("map-info-title");

const infoDescription =
    document.getElementById("map-info-description");

const markers =
    document.querySelectorAll(".map-marker");


/*
 * DATI DEI LUOGHI
 */

const places =
    JSON.parse(
        document.getElementById("map-places").textContent
    );


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

            const mapContainer =
                document.getElementById("map-container");

            const mapTop =
                mapContainer.getBoundingClientRect().top +
                window.scrollY;


            window.scrollTo({

                top: mapTop - 20,

                behavior: "smooth"

            });

        }, 50);

    });

});
