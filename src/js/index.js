import "../css/style.css";
import Handlebars from '../../node_modules/handlebars/dist/handlebars';

const popup = document.querySelector('.popup');
const address = document.querySelector('.address');

let myMap, clusterer, comments = [];

if (localStorage.comments) {
    comments = JSON.parse(localStorage.comments);
}

const getAddressFromCoords = async (coords) => {
    return await ymaps.geocode(coords).then(result => result.geoObjects.get(0).properties.get('text'));
};

const placeMark = (coords, obj) => {
    return new ymaps.Placemark(
        coords,
        {
            Header: obj.place,
            Body: obj.comment,
            Link: obj.address,
            Footer: obj.date,
            CoordX: obj.coords[0],
            CoordY: obj.coords[1]
        },
        {
            iconLayout: 'default#image',
            iconImageHref: img,
            iconImageSize: [22, 33],
            iconImageOffset: [-11, -30]
        });
};

const renderComment = (obj) => {
    const render = Handlebars.compile(`
        <div class="info">
            <span class="name">{{name}}</span>
            <span class="place">{{place}}</span>
            <span class="date">{{date}}</span>
        </div>
        <div class="comment">{{comment}}</div>`);

    return render(obj);
};

const loadComments = (coords, address) => {
    let block = document.querySelector('.comments');

    block.innerHTML = '';
    if (coords) {
        comments.map(comment => {
            if (comment.coords.join() === coords.join()) {
                block.innerHTML += renderComment(comment);
            }
        })
    } else if (address) {
        comments.map(comment => {
            if (comment.address === address) {
                block.innerHTML += renderComment(comment);
            }
        })
    }
};

ymaps.ready(() => {
    try {
        const popup = document.querySelector('.popup'),
            addBtn = document.querySelector('.addBtn'),
            commentForm = document.querySelector('.commentForm'),
            closeBtn = document.querySelector('.closeBtn');

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
            let coords = e.get('coords'),
                domEvent = e.get('domEvent');
            //geoCode(coords);
            console.log(getAddressFromCoords(coords));
            //address.textContent = await getAddressFromCoords(e.get('coords'));
            getAddressFromCoords(coords).then(result => address.textContent = result);
            popup.style.display = 'block';
            popup.style.top = `${domEvent.originalEvent.clientY}px`;
            popup.style.left = `${domEvent.originalEvent.clientX}px`;
            loadComments(coords);
        });

        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log(new FormData(e.target));
        });

    } catch(e) {
        console.error(e.message);
    }
});