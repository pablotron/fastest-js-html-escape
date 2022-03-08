# Fastest JavaScript HTML Escape

Browser tool to benchmark several HTML escape implementations and
scripts to aggregate and plot the results.

## Usage

View `public/`.  Note that the benchmarking uses the [Performance API][]
from a [web worker][], so you'll need to serve it via an [HTTP][]
server.  For example:

```sh
# serve public on port 8080
$ cd ./public && python3 -m http.server 8080
```

Then visit `http://localhost:8080/` to run the benchmarking tool.  It
will run all of the benchmarks to seed the browser's [JIT][], then start
the automated benchmarks.

Let the automated benchmarks run for a while.  While you're waiting, you
can use the panels on the left sidebar of the to run manual tests or
configure the automatic benchmarks.

After the benchmarking tool has run for a while, use the "Download"
button on the left sidebar to download the raw benchmark results as a
[CSV][] file.

Use `bin/agg.rb` to aggregate the raw results, and finally
`bin/plot-line.py` and `bin/plot-barh.py` to plot the aggregate
results as an [SVG][].

**Tip:** [Matplotlib][] generates bloated [SVGs][svg], so you may want
to compact the output with [minify][] or a comparable tool.

Example (assuming raw results saved as `results.csv`):

```sh
# aggregate results, save as "stats.csv"
$ ruby bin/agg.py < results.csv > stats.csv 

# generate line plot, save to "sizes.svg"
$ python3 bin/plot-line.py < stats.csv > sizes.svg

# (optional) save minified line plot as "sizes.min.svg"
$ minify -o sizes{.min,}.svg

# generate bar plot, save to "times.svg"
$ python3 bin/plot-barh.py < stats.csv > times.svg

# (optional) save minified bar plot as "times.min.svg"
$ minify -o times{.min,}.svg
```

## Results

My results (Debian, 64-bit Chrome 99.0.4840.0, 2022-03-08) are shown
below.

<img
  src='out/sizes.svg'
  width='100%'
  title='String Length vs HTML Escape Function Call Time (μs)'
  alt='String Length vs HTML Escape Function Call Time (μs)'
  aria-label='String Length vs HTML Escape Function Call Time (μs)'
/>

<img
  src='out/times.svg'
  width='100%'
  title='HTML Escape Function Call Time (μs)'
  alt='HTML Escape Function Call Time (μs)'
  aria-label='HTML Escape Function Call Time (μs)'
/>

[web worker]: https://en.wikipedia.org/wiki/Web_worker
  "JavaScript that runs from a web page in a background thread."
[performance api]: https://developer.mozilla.org/en-US/docs/Web/API/Performance
  "DOM performance API."
[http]: https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol
  "HyperText Transfer Protocol"
[jit]: https://en.wikipedia.org/wiki/Just-in-time_compilation
  "Just In Time compiler."
[csv]: https://en.wikipedia.org/wiki/Comma-separated_values
  "Comma-separated value."
[svg]: https://en.wikipedia.org/wiki/Scalable_Vector_Graphics
  "Scalable Vector Graphics"
[minify]: https://github.com/tdewolff/minify
  "Minification tool and library written in Go."
[matplotlib]: https://matplotlib.org/
  "Python visualization library."
