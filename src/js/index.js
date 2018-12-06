import "../css/style.css";
import Handlebars from '../../node_modules/handlebars/dist/handlebars';
import moment from 'moment';

const popup = document.querySelector('.popup'),
    form = document.querySelector('.form'),
    closeBtn = document.querySelector('.closeBtn'),
    address = document.querySelector('.address');

let myMap, clusterer, comments = [];

const getAddressFromCoords = async (coords) => {
     let geocode = await ymaps.geocode(coords);
     return geocode.geoObjects.get(0).properties.get('text');
};

const createPlaceMark = (obj) => {
    return new ymaps.Placemark(
        obj.coords,
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
            iconImageHref: '../img/mark.png',
            iconImageSize: [22, 33],
            iconImageOffset: [-11, -33]
        });
};

const renderComment = (obj) => {
    const render = Handlebars.compile(`
        <li>
            <div class="info">
                <span class="name">{{name}}</span>
                <span class="place">{{place}}</span>
                <span class="date">{{date}}</span>
            </div>
            <div class="comment">{{comment}}</div>
        </li>`);

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
        });
    } else if (address) {
        comments.map(comment => {
            if (comment.address === address) {
                block.innerHTML += renderComment(comment);
            }
        });
    }
};

ymaps.ready(() => {
    try {
        let coords;

        if (localStorage.comments) {
            comments = JSON.parse(localStorage.comments);
        }

        myMap = new ymaps.Map('map', {
            center: [59.95, 30.3],
            zoom: 11,
            controls: ['zoomControl', 'searchControl']
        }, {
            searchControlProvider: 'yandex#search'
        });

        let userItemContentLayout = ymaps.templateLayoutFactory.createClass(
            '<h3 class="balloon-header">{{properties.Header|raw}}</h3>' +
            '<a href="#" class="balloon-link" data-x="{{properties.CoordX}}"' +
            'data-y="{{properties.CoordY}}">{{properties.Link|raw}}</a>' +
            '<div class="balloon-body">{{properties.Body|raw}}</div>' +
            '<div class="balloon-footer">{{properties.Footer|raw}}</div>',
            {
                build: function () {
                    userItemContentLayout.superclass.build.call(this);
                    document.querySelector('.balloon-link').addEventListener('click', this.onLinkClick);
                },
                clear: function () {
                    document.querySelector('.balloon-link').removeEventListener('click', this.onLinkClick);
                    userItemContentLayout.superclass.clear.call(this);
                },

                onLinkClick: function (e) {
                    e.preventDefault();
                    let popupTop = (e.clientY > document.documentElement.clientHeight - 524) ?
                        document.documentElement.clientHeight - 524 : e.clientY,
                        popupLeft = (e.clientX > document.documentElement.clientWidth - 380) ?
                        document.documentElement.clientWidth - 380 : e.clientX;
                    
                    popup.style.display = 'block';
                    popup.style.top = `${popupTop}px`;
                    popup.style.left = `${popupLeft}px`;

                    loadComments('', document.querySelector('.balloon-link').textContent);
                    popup.querySelector('.address').textContent = document.querySelector('.balloon-link').textContent;
                    myMap.balloon.close();
                    coords = [e.target.dataset.x, e.target.dataset.y];
                }
            }
        )

        clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedBlackClusterIcons',
            clusterDisableClickZoom: true,
            openBalloonOnClick: true,
            groupByCoordinates: false,
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonItemContentLayout: userItemContentLayout,
            clusterBalloonPanelMaxMapArea: 0,
            clusterBalloonContentLayoutWidth: 280,
            clusterBalloonContentLayoutHeight: 180,
            clusterBalloonPagerSize: 10
        });

        myMap.geoObjects.add(clusterer);

        comments.map(comment => {
            let myPlacemark = createPlaceMark(comment);

            clusterer.add(myPlacemark);
            myPlacemark.events.add('click', async (e) => {
                let domEvent = e.get('domEvent'),
                    popupTop = (domEvent.originalEvent.clientY > document.documentElement.clientHeight - 524) ?
                    document.documentElement.clientHeight - 524 : domEvent.originalEvent.clientY,
                    popupLeft = (domEvent.originalEvent.clientX > document.documentElement.clientWidth - 380) ?
                    document.documentElement.clientWidth - 380 : domEvent.originalEvent.clientX;

                popup.style.display = 'block';
                popup.style.top = `${popupTop}px`;
                popup.style.left = `${popupLeft}px`;

                address.innerHTML = await getAddressFromCoords(myPlacemark.geometry.getCoordinates())
                loadComments(myPlacemark.geometry.getCoordinates());
                coords = myPlacemark.geometry.getCoordinates();
            });
        });

        myMap.events.add('click', async (e) => {
            let domEvent = e.get('domEvent'),
                popupTop = (domEvent.originalEvent.clientY > document.documentElement.clientHeight - 524) ?
                    document.documentElement.clientHeight - 524 : domEvent.originalEvent.clientY,
                popupLeft = (domEvent.originalEvent.clientX > document.documentElement.clientWidth - 380) ?
                document.documentElement.clientWidth - 380 : domEvent.originalEvent.clientX;

            coords = e.get('coords');
            address.innerHTML = await getAddressFromCoords(coords)
            popup.style.display = 'block';
            popup.style.top = `${popupTop}px`;
            popup.style.left = `${popupLeft}px`;
            loadComments(coords);
        });

        closeBtn.addEventListener('click', () => popup.style.display = 'none');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            let data = {},
                myPlacemark;

            data.coords = coords;
            data.address = await getAddressFromCoords(coords);
            data.name = form.children[0].value;
            data.place = form.children[1].value;
            data.comment = form.children[2].value;
            data.date = moment().locale('ru').format('L');

            comments.push(data);
            myPlacemark = createPlaceMark(data);
            loadComments(myPlacemark.geometry.getCoordinates());
            
            myPlacemark.events.add('click', async (e) => {
                let domEvent = e.get('domEvent'),
                    popupTop = (domEvent.originalEvent.clientY > document.documentElement.clientHeight - 524) ?
                    document.documentElement.clientHeight - 524 : domEvent.originalEvent.clientY,
                    popupLeft = (domEvent.originalEvent.clientX > document.documentElement.clientWidth - 380) ?
                    document.documentElement.clientWidth - 380 : domEvent.originalEvent.clientX;
                    
                popup.style.display = 'block';
                popup.style.top = `${popupTop}px`;
                popup.style.left = `${popupLeft}px`;
                loadComments(myPlacemark.geometry.getCoordinates());
                coords = myPlacemark.geometry.getCoordinates();
                popup.querySelector('.address').textContent = await getAddressFromCoords(coords);
            })

            clusterer.add(myPlacemark);
            form.reset();
            localStorage.comments = JSON.stringify(comments);
        });
    } catch(e) {
        console.error(e.message);
    }
});