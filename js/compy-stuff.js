class Complex {
    constructor (re, im) {
        this.re = re
        this.im = im
    }

    add (other) {
        this.re += other.re
        this.im += other.im
    }

    square () {
        const re = this.re * this.re - this.im * this.im
        this.im = this.re * this.im * 2
        this.re = re
    }

    squareAbs () {
        return this.re * this.re + this.im * this.im
    }
}

/**
 * @param {Complex} c
 * @param {number} [maxIter = 20]
 * @returns {number}
 */
function testMandelbrot (c, maxIter = 200) {
    if (!testCardioid(c) && !testBulb(c)) {
        let z = new Complex(0, 0)
        for (let i = 0; i < maxIter; i++) {
            z.square()
            z.add(c)
            if (z.squareAbs() > 4) return i
        }
    }
    return maxIter
}

/**
 * @param {Complex} c
 * @returns {boolean}
 */
function testCardioid (c) {
    const a = (c.re - 1 / 4)
    const q = a * a + c.im * c.im
    return q * (q + a) <= .25 * c.im * c.im
}

/**
 * @param {Complex} c
 * @returns {boolean}
 */
function testBulb (c) {
    const a = c.re + 1
    return a * a + c.im * c.im <= 1 / 16
}

function map (n, start1, stop1, start2, stop2, withinBounds) {

    const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2

    if (!withinBounds) {
        return newval
    }
    if (start2 < stop2) {
        return constrain(newval, start2, stop2)
    } else {
        return constrain(newval, stop2, start2)
    }
}

function constrain (n, low, high) {
    return Math.max(Math.min(n, high), low)
}
