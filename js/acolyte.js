importScripts('https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js')
importScripts('/js/compy-stuff.js')

let id
let bounds
let offset
let maxDimensions
let dimensions
let maxIters

let drawing = false

self.onmessage = function onmessage(event) {

    switch (event.data.message) {

        case 'setup':
            ({ id, offset, bounds, dimensions, maxDimensions, maxIters } = event.data)
            draw()
            break

        case 'draw':
            ({ bounds, maxIters } = event.data)
            draw()
    }
}

function draw() {
    const start = performance.now();
    const data = new Uint8ClampedArray(dimensions.width * dimensions.height * 4);
    const colormap = makeColorMap(maxIters);

    const c = new Complex(0, 0);

    for (let i = 0; i < data.length; i += 4) {
        let x = offset.x + (i / 4) % dimensions.width;
        let y = offset.y + (i / 4) / dimensions.width | 0;

        c.re = map(x, 0, maxDimensions.width, bounds.x.min, bounds.x.max);
        c.im = map(y, 0, maxDimensions.height, bounds.y.min, bounds.y.max);

        const iterBeforeCollapse = testMandelbrot(c, maxIters)

        if (iterBeforeCollapse < maxIters) {
            const idx = iterBeforeCollapse * 3;
            const color = colormap.subarray(idx, idx + 3);
            data.set(color, i);
        }
        data[i + 3] = 255; // alpha
    }

    const buffer = data.buffer;
    const time = performance.now() - start;
    self.postMessage({ message: 'draw', buffer, time }, [buffer]);
}


const colormaps = [];
function makeColorMap(size) {
    if (!colormaps[size]) {
        const colormap = new Uint8ClampedArray(size * 3);
        for (let i = 0; i < size; i++) {
            const rgb = hslToRgb(i / size, 1, .5);
            colormap.set(rgb, i * 3);
        }
        colormaps[size] = colormap;
    }
    return colormaps[size];
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