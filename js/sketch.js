let canvas = document.getElementById('fractal')
const { width, height } = canvas.getBoundingClientRect();
const bounds = { x: { min: -3, max: 1 }, y: { min: -1.5, max: 1.5 } }
bounds.y.max = bounds.y.min + (bounds.x.max - bounds.x.min) * height / width;

function setup() {
    canvas.width = width
    canvas.height = height
    document.addEventListener('keydown', zoomListener, false);
    document.addEventListener('wheel', onWheel, { passive: false });
    $(canvas).click(clickListener)

    const message = { message: 'setup', canvas };
    painter_setup(message)

    log('setup done')
}

function clickListener(e) {

    const parentOffset = $(this).offset()

    const mouseX = e.pageX - parentOffset.left;
    const mouseY = e.pageY - parentOffset.top;

    painter_zoom_on(mouseX, mouseY, .7);
}

function zoomListener(event) {

    if (event.altKey && event.keyCode === 38 || event.keyCode === 40) {

        event.preventDefault()

        let zoom = 0.25
        if (event.keyCode === 38) zoom = -zoom;

        painter_zoom(zoom)
    }
}

function onWheel(e) {
    e.preventDefault();
    const parentOffset = $(canvas).offset()
    const mouseX = e.pageX - parentOffset.left;
    const mouseY = e.pageY - parentOffset.top;
    painter_zoom_on(mouseX, mouseY, 1 + e.deltaY / 100)
}

setup()
