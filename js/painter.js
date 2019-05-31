let ctx
let drawing = false

const numOfAcolytes = 4
let acolytes
let segmentLength

const xBounds = { min: -3, max: 1 }
const yBounds = { min: -1.5, max: 1.5 }

let maxIters = 256

function painter_setup(data) {
    ctx = canvas.getContext('2d')

    segmentLength = canvas.width / numOfAcolytes

    acolytes = _.times(numOfAcolytes, n => {

        const xOffset = n * segmentLength
        const acolyte = new Worker('/js/acolyte.js')

        acolyte.onmessage = onAcolyteMessage

        acolyte.id = n
        acolyte.xOffset = xOffset
        acolyte.segmentLength = segmentLength

        acolyte.canvas = new OffscreenCanvas(segmentLength, canvas.height)
        acolyte.canvas.width = segmentLength
        acolyte.canvas.height = canvas.height

        const offScreenSegment = acolyte.canvas

        acolyte.postMessage(
            {
                message: 'setup',
                canvas: offScreenSegment,
                maxDimensions: {
                    width: canvas.width,
                    height: canvas.height
                },
                xOffset,
                xBounds,
                yBounds,
                maxIters
            },
            [offScreenSegment]
        )

        return acolyte
    })
}

function onAcolyteMessage(event) {

    const acolyte = event.currentTarget
    log(`Message from acolyte: ${acolyte.id}`)

    switch (event.data.message) {

        case 'draw':
            ctx.putImageData(event.data.img, acolyte.xOffset, 0)
            break
    }
}

function painter_draw(data) {
    const mousePos = {
        x: _.get(data, 'mousePos.x'),
        y: _.get(data, 'mousePos.y')
    }

    const zoomBy = _.get(data, 'zoom')

    if (mousePos.x !== undefined) {

        const shiftX = mousePos.x - (canvas.width / 2)
        const shiftY = mousePos.y - (canvas.height / 2)

        const shiftBoundsX = (shiftX / canvas.width) * (xBounds.max - xBounds.min)
        const shiftBoundsY = (shiftY / canvas.height) * (yBounds.max - yBounds.min)

        xBounds.min += shiftBoundsX
        xBounds.max += shiftBoundsX

        yBounds.min += shiftBoundsY
        yBounds.max += shiftBoundsY
    } else if (zoomBy) {

        const xRange = xBounds.max - xBounds.min
        const yRange = yBounds.max - yBounds.min

        const xZoom = (xRange / 4) * zoomBy
        const yZoom = (yRange / 4) * zoomBy

        xBounds.min -= xZoom
        xBounds.max += xZoom

        yBounds.min -= yZoom
        yBounds.max += yZoom

        console.log(`New Bounds`, xBounds, yBounds)
    }

    if (drawing || !ctx || !canvas) return;

    drawing = true;

    for (const acolyte of acolytes) {
        acolyte.postMessage({ message: 'draw', xBounds, yBounds, maxIters })
    }

    drawing = false
}
