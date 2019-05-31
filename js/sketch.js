let canvas
const width = 600
const height = 450

function setup() {

    canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height
    document.addEventListener('keydown', zoomListener, false)
    $(canvas).click(clickListener)

    const message = { message: 'setup', canvas };
    painter_setup(message)

    document.querySelector('body').appendChild(canvas)
    log('setup done')
}

function clickListener(e) {

    const parentOffset = $(this).offset()

    const mouseX = e.pageX - parentOffset.left;
    const mouseY = e.pageY - parentOffset.top;

    painter_draw({ mousePos: { x: mouseX, y: mouseY } })
}

function zoomListener(event) {

    if (event.altKey && event.keyCode === 38 || event.keyCode === 40) {

        event.preventDefault()

        let zoom = 1

        if (event.keyCode === 38) {
            zoom = -zoom
        }
        painter_draw({ zoom })
    }
}

setup()
