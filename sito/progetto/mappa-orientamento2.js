const info = document.getElementById("map-info");

const infoImage =
    document.getElementById("map-info-image");

const infoTitle =
    document.getElementById("map-info-title");

const infoDescription =
    document.getElementById("map-info-description");

const infoClose =
    document.getElementById("map-info-close");

const markers =
    document.querySelectorAll(".map-marker");

let mapHasScrolled = false;


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


/*
 * CHIUDI POPUP
 */

infoClose.addEventListener("click", () => {

    info.classList.remove("visible");


    markers.forEach(marker => {

        marker.classList.remove("active");

    });

});
