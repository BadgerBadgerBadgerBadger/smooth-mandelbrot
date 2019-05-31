importScripts('https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js')
importScripts('/js/compy-stuff.js')

let id
let xBounds
let yBounds
let xOffset
let maxDimensions
let dimensions
let maxIters

let drawing = false

self.onmessage = function onmessage(event) {

    switch (event.data.message) {

        case 'setup':
            ({ id, xOffset, xBounds, yBounds, dimensions, maxDimensions, maxIters } = event.data)
            draw()
            break

        case 'draw':
            ({ xBounds, yBounds, maxIters } = event.data)
            draw()
    }
}

function draw() {
    const start = performance.now();
    const data = new Uint8ClampedArray(dimensions.width * dimensions.height * 4);

    const c = { re: 0, im: 0 };

    for (let i = 0; i < data.length; i += 4) {
        let x = (i / 4) % dimensions.width;
        let y = (i / 4) / dimensions.width | 0;
        const ax = x + xOffset

        c.re = map(ax, 0, maxDimensions.width, xBounds.min, xBounds.max);
        c.im = map(y, 0, maxDimensions.height, yBounds.min, yBounds.max);

        const result = testMandelbrot(c, maxIters)

        if (!result.collapses) {
            const hue = map(result.iterBeforeCollapse, 0, maxIters, 0, 1)
            const rgb = hslToRgb(hue, 1, .5);
            data.set(rgb, i);
        }
        data[i + 3] = 255; // alpha
    }

    const buffer = data.buffer;
    const time = performance.now() - start;
    self.postMessage({ message: 'draw', buffer, time }, [buffer]);
}


function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}

function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}