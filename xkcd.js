var d3 = require("d3");

module.exports = function xkcdplot() {

    // Default parameters.
    var config = {
        width: 600,
        height: 300,
        margin: 20,
        arrowSize: 12,
        arrowAspect: 0.4,
        arrowOffset: 6,
        magnitude: 0.003,
        xlabel: "Time of Day",
        ylabel: "Awesomeness",
        title: "The most important graph ever made",
        xlim: null,
        ylim: null
    };

    // Plot elements.
    var el,
        xscale = d3.scale.linear(),
        yscale = d3.scale.linear();

    // Plotting functions.
    var elements = [];

    // The XKCD object itself.
    var xkcd = function (nm) {
        el = d3.select(nm).append("svg")
                    .attr("width", config.width + 2 * config.margin)
                    .attr("height", config.height + 2 * config.margin)
                .append("g")
                    .attr("transform", "translate(" + config.margin + ", "
                                                    + config.margin + ")");
        return xkcd;
    };

    // Getters and setters.
    function makeGetterSetter(name) {
        xkcd[name] = function (value) {
            if (arguments.length === 0) {
                return config[name];
            }
            config[name] = value;
            return xkcd;
        };
    }
    for (var name in config) {
        makeGetterSetter(name);
    }

    // Do the render.
    xkcd.draw = function () {
        // Set the axes limits.
        xscale.domain(config.xlim).range([0, config.width]);
        yscale.domain(config.ylim).range([config.height, 0]);

        // Compute the zero points where the axes will be drawn.
        var x0 = xscale(0),
            y0 = yscale(0);

        // Draw the axes.
        var axis = d3.svg.line().interpolate(xinterp);
        el.selectAll(".axis").remove();
        el.append("svg:path")
            .attr("class", "x axis")
            .attr("d", axis([[0, y0], [config.width, y0]]));
        el.append("svg:path")
            .attr("class", "y axis")
            .attr("d", axis([[x0, 0], [x0, config.height]]));

        // Laboriously draw some arrows at the ends of the axes.
        var aa = config.arrowAspect * config.arrowSize,
            o = config.arrowOffset,
            s = config.arrowSize;
        el.append("svg:path")
            .attr("class", "x axis arrow")
            .attr("d", axis([[config.width - s + o, y0 + aa], [config.width + o, y0], [config.width - s + o, y0 - aa]]));
        el.append("svg:path")
            .attr("class", "x axis arrow")
            .attr("d", axis([[s - o, y0 + aa], [-o, y0], [s - o, y0 - aa]]));
        el.append("svg:path")
            .attr("class", "y axis arrow")
            .attr("d", axis([[x0 + aa, s - o], [x0, -o], [x0 - aa, s - o]]));
        el.append("svg:path")
            .attr("class", "y axis arrow")
            .attr("d", axis([[x0 + aa, config.height - s + o], [x0, config.height + o], [x0 - aa, config.height - s + o]]));

        for (var i = 0, l = elements.length; i < l; ++i) {
            var e = elements[i];
            e.func(e.data, e.x, e.y, e.opts);
        }

        // Add some axes labels.
        el.append("text").attr("class", "x label")
                              .attr("text-anchor", "end")
                              .attr("x", config.width - s)
                              .attr("y", y0 + aa)
                              .attr("dy", ".75em")
                              .text(config.xlabel);
        el.append("text").attr("class", "y label")
                              .attr("text-anchor", "end")
                              .attr("x", aa)
                              .attr("y", x0)
                              .attr("dy", "-.75em")
                              .attr("transform", "rotate(-90)")
                              .text(config.ylabel);

        // And a title.
        el.append("text").attr("class", "title")
                              .attr("text-anchor", "end")
                              .attr("x", config.width)
                              .attr("y", 0)
                              .text(config.title);

        return xkcd;
    };

    // Adding plot elements.
    xkcd.plot = function (data, opts) {
        var x = function (d) { return d.x; },
            y = function (d) { return d.y; },
            cx = function (d) { return xscale(x(d)); },
            cy = function (d) { return yscale(y(d)); },
            xl = d3.extent(data, x),
            yl = d3.extent(data, y);

        // Rescale the axes.
        config.xlim = config.xlim || xl;
        config.xlim[0] = Math.min(config.xlim[0], xl[0]);
        config.xlim[1] = Math.max(config.xlim[1], xl[1]);
        config.ylim = config.ylim || yl;
        config.ylim[0] = Math.min(config.ylim[0], yl[0]);
        config.ylim[1] = Math.max(config.ylim[1], yl[1]);

        // Add the plotting function.
        elements.push({
                        data: data,
                        func: lineplot,
                        x: cx,
                        y: cy,
                        opts: opts
                      });

        return xkcd;
    };

    // Plot styles.
    function lineplot(data, x, y, opts) {
        var line = d3.svg.line().x(x).y(y).interpolate(xinterp),
            bgline = d3.svg.line().x(x).y(y),
            strokeWidth = _get(opts, "stroke-width", 3),
            color = _get(opts, "stroke", "steelblue");
        el.append("svg:path").attr("d", bgline(data))
                             .style("stroke", "white")
                             .style("stroke-width", 2 * strokeWidth + "px")
                             .style("fill", "none")
                             .attr("class", "bgline");
        el.append("svg:path").attr("d", line(data))
                             .style("stroke", color)
                             .style("stroke-width", strokeWidth + "px")
                             .style("fill", "none");
    };

    // XKCD-style line interpolation. Roughly based on:
    //    jakevdp.github.com/blog/2012/10/07/xkcd-style-plots-in-matplotlib
    function xinterp (points) {
        // Scale the data.
        var f = [xscale(config.xlim[1]) - xscale(config.xlim[0]),
                 yscale(config.ylim[1]) - yscale(config.ylim[0])],
            z = [xscale(config.xlim[0]),
                 yscale(config.ylim[0])],
            scaled = points.map(function (p) {
                return [(p[0] - z[0]) / f[0], (p[1] - z[1]) / f[1]];
            });

        // Compute the distance along the path using a map-reduce.
        var dists = scaled.map(function (d, i) {
            if (i == 0) return 0.0;
            var dx = d[0] - scaled[i - 1][0],
                dy = d[1] - scaled[i - 1][1];
            return Math.sqrt(dx * dx + dy * dy);
        }),
            dist = dists.reduce(function (curr, d) { return d + curr; }, 0.0);

        // Choose the number of interpolation points based on this distance.
        var N = Math.round(200 * dist);

        // Re-sample the line.
        var resampled = [];
        dists.map(function (d, i) {
            if (i == 0) return;
            var n = Math.max(3, Math.round(d / dist * N)),
                spline = d3.interpolate(scaled[i - 1][1], scaled[i][1]),
                delta = (scaled[i][0] - scaled[i - 1][0]) / (n - 1);
            for (var j = 0, x = scaled[i - 1][0]; j < n; ++j, x += delta)
                resampled.push([x, spline(j / (n - 1))]);
        });

        // Compute the gradients.
        var gradients = resampled.map(function (a, i, d) {
            if (i == 0) return [d[1][0] - d[0][0], d[1][1] - d[0][1]];
            if (i == resampled.length - 1)
                return [d[i][0] - d[i - 1][0], d[i][1] - d[i - 1][1]];
            return [0.5 * (d[i + 1][0] - d[i - 1][0]),
                    0.5 * (d[i + 1][1] - d[i - 1][1])];
        });

        // Normalize the gradient vectors to be unit vectors.
        gradients = gradients.map(function (d) {
            var len = Math.sqrt(d[0] * d[0] + d[1] * d[1]);
            return [d[0] / len, d[1] / len];
        });

        // Generate some perturbations.
        var perturbations = smooth(resampled.map(d3.random.normal()), 3);

        // Add in the perturbations and re-scale the re-sampled curve.
        var result = resampled.map(function (d, i) {
            var p = perturbations[i],
                g = gradients[i];
            return [(d[0] + config.magnitude * g[1] * p) * f[0] + z[0],
                    (d[1] - config.magnitude * g[0] * p) * f[1] + z[1]];
        });

        return result.join("L");
    }

    // Smooth some data with a given window size.
    function smooth(d, w) {
        var result = [];
        for (var i = 0, l = d.length; i < l; ++i) {
            var mn = Math.max(0, i - 5 * w),
                mx = Math.min(d.length - 1, i + 5 * w),
                s = 0.0;
            result[i] = 0.0;
            for (var j = mn; j < mx; ++j) {
                var wd = Math.exp(-0.5 * (i - j) * (i - j) / w / w);
                result[i] += wd * d[j];
                s += wd;
            }
            result[i] /= s;
        }
        return result;
    }

    // Get a value from an object or return a default if that doesn't work.
    function _get(d, k, def) {
        if (typeof d === "undefined") return def;
        if (typeof d[k] === "undefined") return def;
        return d[k];
    }

    return xkcd;

}
