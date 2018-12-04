import "../css/style.css";

let myMap, clusterer;

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
    } catch(e) {
        console.error(e.message);
    }
});