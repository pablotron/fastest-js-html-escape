(() => {
  "use strict";

  // load functions
  importScripts('common.js');

  const NUM_RUNS = 10000;

  // run function NUM_RUNS times, return mean duration (μs)
  const bench = (init_fn, test_fn) => {
    const prefix = Math.random().toString(),
          m0 = prefix + '-0', // start mark name
          m1 = prefix + '-1', // end mark name
          m2 = prefix + '-2'; // measure name

    // run function NUM_RUNS times, measure function
    const data = init_fn();
    performance.mark(m0);
    for (let i = 0; i < NUM_RUNS; i++) {
      test_fn(data);
    }
    performance.mark(m1);

    // get duration
    const {duration} = performance.measure(m2, m0, m1);

    // clear performance measurements
    [m0, m1].forEach(s => void performance.clearMarks(s));
    performance.clearMeasures(m2);

    // return mean duration in us
    return 1000 * duration / (1.0 * NUM_RUNS);
  };

  //
  // Return a test string of length `len`.
  //
  const get_test_str = (len = 10) => {
    // build initial intermediate string value
    const v = '<>&\'"asdf' + Math.random() + 'zxcv<>&\'"';

    // calculate # of dups needed to reach desired length
    const num_dups = Math.ceil((1.0 * len) / v.length);

    // join array of num_dups copies of intermediate string
    // value, then return a slice of `len` characters
    return (new Array(num_dups)).fill(v).join('').slice(0, len);
  };

  // bind to message handler
  onmessage = (e) => {
    // cache test function
    const fn = FNS[e.data.test];

    // run benchmark get mean time
    const mean = bench(() => get_test_str(e.data.len), fn);

    // post result
    postMessage({
      data: e.data,
      mean: mean,
      norm_mean: mean * (FNS.norm_coef_num / (e.data.len * e.data.num)),
    });
  };
})();
