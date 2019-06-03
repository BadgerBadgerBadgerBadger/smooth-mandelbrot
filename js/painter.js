let ctx
let drawing = false

const numOfAcolytes = navigator.hardwareConcurrency || 4
let acolytes
let segmentLength


let maxIters = 256

class Acolyte {
    constructor(i) {
        this.id = i;
        this.idle = true;
        this.nextMsg = null;
        this.worker = new Worker('js/acolyte.js');
        this.segmentLength = canvas.height / numOfAcolytes | 0;
        this.offset = { x: 0, y: i * this.segmentLength };

        this.dimensions = {
            width: canvas.width,
            height: this.segmentLength
        };
        this.worker.onmessage = this.messageHandler.bind(this);
        this.setup();
    }
    setup() {
        this.sendMessage({
            message: 'setup',
            dimensions: this.dimensions,
            maxDimensions: {
                width: canvas.width,
                height: canvas.height
            },
            offset: this.offset,
            bounds,
            maxIters
        })
    }
    draw(bounds) {
        this.sendMessage({ message: 'draw', bounds, maxIters })
    }
    sendMessage(msg) {
        if (this.idle) {
            this.idle = false;
            this.worker.postMessage(msg);
            this.nextMsg = null;
        } else {
            this.nextMsg = msg;
        }
    }
    messageHandler(event) {
        this.idle = true;
        if (this.nextMsg) this.sendMessage(this.nextMsg);
        switch (event.data.message) {
            case 'draw':
                console.log(`Rendered tile in ${event.data.time}ms`)
                const {
                    dimensions: { width, height },
                    offset: { x, y }
                } = this;
                const { buffer } = event.data;
                draw_tile(buffer, x, y, width, height);
                break
        }
    }
}

function painter_setup(data) {
    ctx = canvas.getContext('2d')
    acolytes = Array(numOfAcolytes).fill()
        .map((_, i) => new Acolyte(i));
}


const update_bounds = function update_bounds(bounds) {
    for (const acolyte of acolytes) {
        acolyte.draw(bounds)
    }
};

function draw_tile(buffer, x, y, w, h) {
    let data = new Uint8ClampedArray(buffer);
    let idata = new ImageData(data, w, h);
    ctx.putImageData(idata, x, y);
}

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
    const h = w * canvas.height / canvas.width;

    const shiftBoundsX = (x / canvas.width) * (bounds.x.max - bounds.x.min)
    const shiftBoundsY = (y / canvas.height) * (bounds.y.max - bounds.y.min)

    bounds.x.min += shiftBoundsX - w * (x / canvas.width);
    bounds.x.max = bounds.x.min + w;
    bounds.y.min += shiftBoundsY - h * (y / canvas.height);
    bounds.y.max = bounds.y.min + h;

    update_bounds(bounds);
}