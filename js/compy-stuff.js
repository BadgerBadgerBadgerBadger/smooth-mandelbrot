/**
 * @typedef {Object} Complex
 *
 * @property {number} re
 * @property {number} im
 */

/**
 * @typedef {Object} MandeltestResult
 *
 * @property {boolean} collapses
 * @property {number} iterBeforeCollapse
 */

/**
 * @param {Complex} c
 * @param {number} [maxIter = 20]
 * @returns {MandeltestResult}
 */
function testMandelbrot(c, maxIter = 200) {

    let z = {
        re: 0,
        im: 0
    }

    const result = {
        iterBeforeCollapse: 0,
        collapses: true
    }

    for (let i = 0; i < maxIter; i++) {

        result.iterBeforeCollapse++

        z = complexAdd(complexMult(z, z), c)

        if (squareComplexAbs(z) > 4) {
            result.collapses = false
            break
        }

    }

    return result
}

/**
 * @param {Complex} c
 * @param {{width: number, height: number}} dimensions
 * @param {{min: number, max: number}} xBounds
 * @param {{min: number, max: number}} yBounds
 * @param {number} maxIters
 */
function determineHue(c, dimensions, xBounds, yBounds, maxIters = 200) {

    const x = c.x
    const y = c.y

    let a = map(x, 0, dimensions.width, xBounds.min, xBounds.max)
    let b = map(y, 0, dimensions.height, yBounds.min, yBounds.max)

    const result = testMandelbrot({ re: a, im: b }, maxIters)

    if (result.collapses) {
        return [0]
    } else {

        const hue = 360 - map(result.iterBeforeCollapse, 0, maxIters, 0, 360)
        return [hue, 255, 255]
    }
}

function complexAdd(num1, num2) {
    return {
        re: num1.re + num2.re,
        im: num1.im + num2.im
    }
}

function complexMult(num1, num2) {
    return {
        re: (num1.re * num2.re) - (num1.im * num2.im),
        im: (num1.re * num2.im) + (num1.im * num2.re)
    }
}

function squareComplexAbs(num) {
    return num.re * num.re + num.im * num.im;
}

function map(n, start1, stop1, start2, stop2, withinBounds) {

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

function constrain(n, low, high) {
    return Math.max(Math.min(n, high), low);
}
