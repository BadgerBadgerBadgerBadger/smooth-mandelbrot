let ctx
let drawing = false

const numOfAcolytes = navigator.hardwareConcurrency || 4
let acolytes
let segmentLength

const xBounds = { min: -3, max: 1 }
const yBounds = { min: -1.5, max: 1.5 }

let maxIters = 256

function painter_setup(data) {
    ctx = canvas.getContext('2d')

    segmentLength = canvas.height / numOfAcolytes | 0

    acolytes = _.times(numOfAcolytes, n => {

        const yOffset = n * segmentLength
        const acolyte = new Worker('/js/acolyte.js')

        acolyte.onmessage = onAcolyteMessage

        acolyte.id = n
        acolyte.offset = { x: 0, y: yOffset }
        acolyte.segmentLength = segmentLength
        acolyte.dimensions = {
            width: canvas.width,
            height: segmentLength
        };

        acolyte.postMessage({
            message: 'setup',
            dimensions: acolyte.dimensions,
            maxDimensions: {
                width: canvas.width,
                height: canvas.height
            },
            offset: acolyte.offset,
            xBounds,
            yBounds,
            maxIters
        })

        return acolyte
    })
}

function onAcolyteMessage(event) {

    const acolyte = event.currentTarget
    log(`Message from acolyte: ${acolyte.id}`)

    switch (event.data.message) {
        case 'draw':
            console.log(`Rendered tile in ${event.data.time}ms`)
            let data = new Uint8ClampedArray(event.data.buffer);
            let idata = new ImageData(data, acolyte.dimensions.width, acolyte.dimensions.height);
            ctx.putImageData(idata, acolyte.offset.x, acolyte.offset.y)
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

    for (const acolyte of acolytes) {
        acolyte.postMessage({ message: 'draw', xBounds, yBounds, maxIters })
    }
}
