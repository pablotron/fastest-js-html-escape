(() => {
  "use strict";

  // load functions
  importScripts('common.js');

  const bench = (fn) => {
    const t0 = Date.now();
    fn();
    return Date.now() - t0;
  };

  //
  // Create array containing `num` test strings of length `len`.
  //
  const get_test_data = (num = 100000, len = 10) => {
    return Object.freeze((new Array(num)).map(() => {
      // build initial intermediate string value
      const v = '<>&\'"' + Math.random() + '<>&\'"';

      // calculate # of dups needed to reach desired length
      const num_dups = Math.ceil((1.0 * len) / v.length);

      // join array of num_dups copies of intermediate string
      // value, then return a slice of `len` characters
      const t = (new Array(num_dups)).fill(v).join('').slice(0, len);

      console.log({
        num: num,
        len: len,
        v: v,
        v_len: v.length,
        t_len: t.length,
        num_dups: num_dups,
      });

      return t;
    }));
  };

  // number fo times to run benchmark
  const NUM_RUNS = 20;

  onmessage = (e) => {
    // cache test data and test function
    const a = get_test_data(e.data.num, e.data.len);
    const fn = FNS[e.data.test];

    // run benchmark NUM_RUNS times, save run times
    //
    // note: we deliberately store the results in r which is outside the
    // scope of this function in order to prevent the work from being
    // optimized away.
    let r = [];
    const runs = (new Array(NUM_RUNS).fill(0)).map(
      () => bench(() => { r = a.map(fn) })
    );

    // calculate mean time
    const mean = runs.reduce((r, v) => r + v, 0) / (1.0 * NUM_RUNS);

    // post result
    postMessage({
      data: e.data,
      mean: mean,
      runs: runs,
    });
  };
})();
