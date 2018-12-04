import "../css/style.css";

const popup = document.querySelector('.popup');
const address = document.querySelector('.address');

let myMap, clusterer;

const getAddressFromCoords = (coords) => {
    return ymaps.geocode(coords).then(result => result.geoObjects.get(0).properties.get('text'));
}

ymaps.ready(async () => {
    try {
        myMap = new ymaps.Map('map', {
            center: [59.95, 30.3],
            zoom: 11,
            controls: ['zoomControl', 'searchControl']
        }, {
            searchControlProvider: 'yandex#search'
        });

        clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedBlackClusterIcons',
            clusterDisableClickZoom: true,
            openBalloonOnClick: true
        });

        myMap.geoObjects.add(clusterer);

        myMap.events.add('click', (e) => {
            console.log(e.get('domEvent'))
            //coords = e.get('coords');
            //geoCode(coords);
            address.textContent = getAddressFromCoords(e.get('coords'));
            popup.style.display = 'block';
            popup.style.top = `${e.get('domEvent').originalEvent.clientY}px`;
            popup.style.left = `${e.get('domEvent').originalEvent.clientX}px`;
            //loadComments(coords);
        })

    } catch(e) {
        console.error(e.message);
    }
});