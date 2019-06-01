let ctx
let drawing = false

const numOfAcolytes = navigator.hardwareConcurrency || 4
let acolytes
let segmentLength


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
            bounds,
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


const update_bounds = _.throttle(function update_bounds(bounds) {
    for (const acolyte of acolytes) {
        acolyte.postMessage({ message: 'draw', bounds, maxIters })
    }
}, 150);

function painter_zoom(zoomBy) {
    const xRange = bounds.x.max - bounds.x.min
    const yRange = bounds.y.max - bounds.y.min

    const xZoom = xRange * zoomBy
    const yZoom = yRange * zoomBy

    bounds.x.min -= xZoom
    bounds.x.max += xZoom

    bounds.y.min -= yZoom
    bounds.y.max += yZoom

    update_bounds(bounds);
}


function painter_center(x, y) {
    const shiftX = x - (canvas.width / 2)
    const shiftY = y - (canvas.height / 2)

    const shiftBoundsX = (shiftX / canvas.width) * (bounds.x.max - bounds.x.min)
    const shiftBoundsY = (shiftY / canvas.height) * (bounds.y.max - bounds.y.min)

    bounds.x.min += shiftBoundsX
    bounds.x.max += shiftBoundsX

    bounds.y.min += shiftBoundsY
    bounds.y.max += shiftBoundsY

    update_bounds(bounds);
}

function painter_zoom_on(x, y, zoom) {
    const w = (bounds.x.max - bounds.x.min) * zoom;
    const h = (bounds.y.max - bounds.y.min) * zoom;

    const shiftBoundsX = (x / canvas.width) * (bounds.x.max - bounds.x.min)
    const shiftBoundsY = (y / canvas.height) * (bounds.y.max - bounds.y.min)

    bounds.x.min += shiftBoundsX - w * (x / canvas.width);
    bounds.x.max = bounds.x.min + w;
    bounds.y.min += shiftBoundsY - h * (y / canvas.height);
    bounds.y.max = bounds.y.min + h;

    update_bounds(bounds);
}