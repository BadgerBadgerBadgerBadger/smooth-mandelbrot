importScripts('https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js')
importScripts('/js/compy-stuff.js')

let id
let canvas
let ctx
let xBounds
let yBounds
let xOffset
let maxDimensions
let maxIters

let drawing = false

self.onmessage = function onmessage(event) {

    switch (event.data.message) {

        case 'setup':
            ({id, canvas, xOffset, xBounds, yBounds, maxDimensions, maxIters} = event.data)
            ctx = canvas.getContext('2d')

            draw()
            break

        case 'draw':
            ({ xBounds, yBounds, maxIters } = event.data)
            draw()
    }
}

function draw() {

    if (drawing) {
        return
    }

    if (!canvas) {
        return
    }

    drawing = true

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {

            const ax = x + xOffset

            const c = {
                re: map(ax, 0, maxDimensions.width, xBounds.min, xBounds.max),
                im: map(y, 0, maxDimensions.height, yBounds.min, yBounds.max)
            }

            const result = testMandelbrot(c, maxIters)

            if (result.collapses) {
                ctx.fillStyle = '#000000'
            } else {

                const hue = map(result.iterBeforeCollapse, 0, maxIters, 0, 360)
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
            }

            ctx.fillRect(x, y, 1, 1)
        }
    }

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)

    self.postMessage({ message: 'draw', img })

    drawing = false
}
