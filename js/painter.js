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
                drawTile(buffer, x, y, width, height);
                break
        }
    }
}

function painterSetup() {
    ctx = canvas.getContext('2d')
    acolytes = Array(numOfAcolytes).fill()
        .map((_, i) => new Acolyte(i));
}


const updateBounds = function updateBounds(bounds) {
    for (const acolyte of acolytes) {
        acolyte.draw(bounds)
    }
};

function drawTile(buffer, x, y, w, h) {
    let data = new Uint8ClampedArray(buffer);
    let idata = new ImageData(data, w, h);
    ctx.putImageData(idata, x, y);
}

function painterZoom(zoomBy) {
    const dx = (bounds.x.max - bounds.x.min) / 2;
    const dy = (bounds.y.max - bounds.y.min) / 2;

    bounds.x.min += dx * zoomBy
    bounds.x.max -= dx * zoomBy
    bounds.y.min += dy * zoomBy
    bounds.y.max -= dy * zoomBy

    updateBounds(bounds);
}

function painterMove(x, y) {
    const w = bounds.x.max - bounds.x.min
    const h = bounds.y.max - bounds.y.min
    const dx = -x * w / canvas.width
    const dy = -y * h / canvas.width
    bounds.x.min += dx
    bounds.x.max += dx
    bounds.y.min += dy
    bounds.y.max += dy
    updateBounds(bounds);
}


function painterCenter(x, y) {
    const shiftX = x - (canvas.width / 2)
    const shiftY = y - (canvas.height / 2)

    const shiftBoundsX = (shiftX / canvas.width) * (bounds.x.max - bounds.x.min)
    const shiftBoundsY = (shiftY / canvas.height) * (bounds.y.max - bounds.y.min)

    bounds.x.min += shiftBoundsX
    bounds.x.max += shiftBoundsX

    bounds.y.min += shiftBoundsY
    bounds.y.max += shiftBoundsY

    updateBounds(bounds);
}

function painterZoomOn(x, y, zoom) {
    const w = (bounds.x.max - bounds.x.min) * zoom;
    const h = w * canvas.height / canvas.width;

    const shiftBoundsX = (x / canvas.width) * (bounds.x.max - bounds.x.min)
    const shiftBoundsY = (y / canvas.height) * (bounds.y.max - bounds.y.min)

    bounds.x.min += shiftBoundsX - w * (x / canvas.width);
    bounds.x.max = bounds.x.min + w;
    bounds.y.min += shiftBoundsY - h * (y / canvas.height);
    bounds.y.max = bounds.y.min + h;

    updateBounds(bounds);
}