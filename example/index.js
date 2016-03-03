var xkcdplot = require("../xkcd");

// Generate some data.
function f1 (x) {
    return Math.exp(-0.5 * (x - 1) * (x - 1)) * Math.sin(x + 0.2) + 0.05;
}

function f2 (x) {
    return 0.5 * Math.cos(x - 0.5) + 0.1;
}

var xmin = -1.0,
    xmax = 7,
    N = 100,
    data = d3.range(xmin, xmax, (xmax - xmin) / N).map(function (d) {
        return {x: d, y: f1(d)};
    })
    data2 = d3.range(xmin, xmax, (xmax - xmin) / N).map(function (d) {
        return {x: d, y: f2(d)};
    });

// Build the plot.
var plot = xkcdplot();
plot("body");

// Add the lines.
plot.plot(data);
plot.plot(data2, {stroke: "red"});

// Render the image.
plot.xlim([-1.5, 7.5]).draw();
