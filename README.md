XKCD-style plots in Javascript using D3
=======================================

*NOTE: This is a fork of Dan Foreman-Mackey's awesome [xkcdplot](http://dan.iel.fm/xkcd/), packaged for npm/browserify/webpack. The following description is from Dan's original post.*

Inspired by [this blog post](http://jakevdp.github.com/blog/2012/10/07/xkcd-style-plots-in-matplotlib/) and Mike Bostock's comment on [this HN thread](http://news.ycombinator.com/item?id=4597977), I decided to make an [XKCD-style plot](http://xkcd.com/1064/) in Javascript using [D3](http://d3js.org/) with a [custom interpolation function](http://bl.ocks.org/3310323). I also tried to use the ["reusable chart" paradigm](http://bost.ocks.org/mike/chart/).

You should really check out [the source](http://bl.ocks.org/3914862).

Here's an example...

![example XKCD chart](https://cloud.githubusercontent.com/assets/18193/13509386/05b58e26-e140-11e5-9d89-e347ca368058.png)


Usage
-----

Install the package:

    npm install --save xkcdplot

Import xkcd plot:

    import xkcdplot from "xkcdplot";

Create the plot:

    var plot = xkcdplot();

Configure it:

    plot
      .width(800)
      .height(600);

Generate at least one series of data of the form `[{ x: ..., y: ... }, ...]`:

    let data = [
      { x: 1, y: 2 },
      { x: 2, y: 3 }
    ];

    let data2 = [
      { x: 1, y: 3 },
      { x: 2, y: 2 }
    ];

Add them to the plot:

    plot.plot(data);
    plot.plot(data2, { stroke: "red" });

Set any final settings, then draw it:

    plot("body")
      .xlim([-1.5, 7.5])
      .draw();


Humor Sans
----------

If you're using webpack you can load the "Humor Sans" font by simply importing it:

    import "xkcdplot/humor-sans";

Or without ES2015 modules:

    require("xkcdplot/humor-sans");

You need to configure the following loaders (or similar):

    { test: /\.css$/, loader: "style-loader!css-loader" },
    { test: /\.(eot|woff2?|ttf|svg)$/, loader: "file-loader" }
