(() => {
  "use strict";

  // load functions
  importScripts('common.js');

  const NUM_RUNS = 1000;

  // run benchmark num times, return mean duration (μs)
  const bench = (num, init_fn, test_fn) => {
    const prefix = Math.random().toString();
    let marks = [];
    let measures = [];

    let r = 0.0;
    for (let i = 0; i < num; i++) {
      const m0 = prefix + '-0', // start mark name
            m1 = prefix + '-1', // end mark name
            m2 = prefix + '-2'; // measure name

      // measure function
      const data = init_fn();
      performance.mark(m0);
      for (let i = 0; i < NUM_RUNS; i++) {
        test_fn(data);
      }
      performance.mark(m1);

      // get duration
      const {duration} = performance.measure(m2, m0, m1);

      // save ids
      marks.push(m0, m1);
      measures.push(m2);

      // normalize, add to result
      r += duration / (1.0 * NUM_RUNS * num);
    }

    // clear performance measurements
    marks.forEach(s => void performance.clearMarks(s));
    measures.forEach(s => performance.clearMeasures(s));

    // return mean duration
    return r * 1000;
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
    const mean = bench(e.data.num, () => get_test_str(e.data.len), fn);

    // post result
    postMessage({
      data: e.data,
      mean: mean,
      norm_mean: mean * (FNS.norm_coef_num / (e.data.len * e.data.num)),
    });
  };
})();
