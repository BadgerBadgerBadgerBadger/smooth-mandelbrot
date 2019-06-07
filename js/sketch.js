let canvas = document.getElementById('fractal')
const { width, height } = canvas.getBoundingClientRect();
const bounds = { x: { min: -3, max: 2 }, y: { min: -1.3, max: 1.3 } }

function setup() {
    canvas.width = width
    canvas.height = height
    bounds.y.max = .5 * (bounds.x.max - bounds.x.min) * height / width;
    bounds.y.min = -.5 * (bounds.x.max - bounds.x.min) * height / width;

    document.addEventListener('keydown', zoomListener, false);
    document.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('dblclick', clickListener, { passive: false });
    document.addEventListener('mousemove', mouseListener, { passive: true });

    painterSetup()
}

function clickListener(e) {
    e.preventDefault();
    painterZoomOn(e.offsetX, e.offsetY, 0.5);
}

function mouseListener(e) {
    if (e.buttons & 1) {
        painterMove(e.movementX, e.movementY);
    }
}

function zoomListener(event) {

    if (event.altKey && event.keyCode === 38 || event.keyCode === 40) {

        event.preventDefault()
        const z = 0.25
        let zoom = (event.keyCode === 38) ? z : -z;

        painterZoom(zoom)
    }
}

function onWheel(e) {
    e.preventDefault();
    painterZoomOn(e.offsetX, e.offsetY, 1 + e.deltaY / 100)
}

setup()
