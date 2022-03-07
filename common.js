const FNS = (() => {
  "use strict";

  // pick random element of array
  const pick = (ary) => ary[Math.floor(Math.random() * ary.length)];

  // get last element of array
  const last = (ary) => ary[ary.length - 1];

  // query selector and query selector all
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));

  // html escape (text-based, old)
  const h0 = (() => {
    const E = [
      [/&/g, '&amp;'],
      [/</g, '&lt;'],
      [/>/g, '&gt;'],
      [/'/g, '&apos;'],
      [/"/g, '&quot;'],
    ];

    return (v) => E.reduce((r, e) => r.replace(...e), v);
  })();

  // html escape (text-based, old, frozen)
  const h1 = (() => {
    const E = Object.freeze([
      [/&/g, '&amp;'],
      [/</g, '&lt;'],
      [/>/g, '&gt;'],
      [/'/g, '&apos;'],
      [/"/g, '&quot;'],
    ]);

    return (v) => E.reduce((r, e) => r.replace(...e), v);
  })();


  // html escape (text-based, new, capture)
  const h2 = (() => {
    // characters to match
    const M = /([&<>'"])/g;

    // map of char to entity
    const E = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&apos;',
      '"': '&quot;',
    };

    // build and return escape function
    return (v) => v.replace(M, (_, c) => E[c]);
  })();

  // html escape (text-based, new, capture, frozen)
  const h3 = (() => {
    // characters to match
    // (cannot freeze regex)
    const M = /([&<>'"])/g;

    // map of char to entity
    const E = Object.freeze({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&apos;',
      '"': '&quot;',
    });

    // build and return escape function
    return (v) => v.replace(M, (_, c) => E[c]);
  })();

  // html escape (text-based, new, no capture)
  const h4 = (() => {
    // characters to match
    const M = /[&<>'"]/g;

    // map of char to entity
    const E = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&apos;',
      '"': '&quot;',
    };

    // build and return escape function
    return (v) => v.replace(M, (c) => E[c]);
  })();

  // html escape (text-based, new, no capture, frozen)
  const h5 = (() => {
    // characters to match
    const M = /[&<>'"]/g;

    // map of char to entity
    const E = Object.freeze({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&apos;',
      '"': '&quot;',
    });

    // build and return escape function
    return (v) => v.replace(M, (c) => E[c]);
  })();

  // html escape (text-based, new, no capture, frozen)
  const h6 = Object.freeze((() => {
    // characters to match
    const M = /[&<>'"]/g;

    // map of char to entity
    const E = Object.freeze({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&apos;',
      '"': '&quot;',
    });

    // build and return escape function
    return (v) => v.replace(M, (c) => E[c]);
  })());

//   // html escape (dom-based)
//   // note: textContent rather than innerText; the latter does not
//   // handle newlines correctly
//   const hd = (() => {
//     const e = document.createElement('p');
//     return (v) => { e.textContent = v; return e.innerHTML };
//   })();

  const TESTS = [{
    id: 'h0',
    name: "h0: Reduce",
    text: `
      HTML escape with replacement regular expression array.
    `,
  }, {
    id: 'h1',
    name: "h1: Reduce, Frozen Array",
    text: `
      HTML escape with frozen replacement regular expression array.
    `,
  }, {
    id: 'h2',
    name: "h2: Match, Capture",
    text: `
      HTML escape with capturing regex and replacement entity map.
    `,
  }, {
    id: 'h3',
    name: "h3: Match, Capture, Frozen",
    text: `
      HTML escape with capturing regex and frozen replacement entity map.
    `,
  }, {
    id: 'h4',
    name: "h4: Match, No Capture",
    text: `
      HTML escape with non-capturing regex and replacement entity map.
    `,
  }, {
    id: 'h5',
    name: "h5: Match, No Capture, Frozen Map",
    text: `
      HTML escape with non-capturing regex and frozen replacement entity
      map.
    `,
  }, {
    id: 'h6',
    name: "h6: Match, No Capture, Frozen Map/Function",
    text: `
      HTML escape with non-capturing regex, frozen replacement entity
      map, and frozen function.
    `,
  }, {
    id: 'h7',
    name: "h7: Reduce, Replace All",
    text: `
      HTML escape with replacement string array.
    `,
  }, {
    id: 'h8',
    name: "h8: Reduce, Replace All, Frozen",
    text: `
      HTML escape with frozen replacement string array.
    `,
  }, {
    id: 'h9',
    name: "h8: Replace All Literal",
    text: `
      HTML escape series of literal replaceAll()s.
    `,
  }];

  const LENS = [{
    id: '10',
    name: '10 characters',
    text: 'Strings of length 10.'
  }, {
    id: '50',
    name: '50 characters',
    text: 'Strings of length 50.'
  }, {
    id: '100',
    name: '100 characters',
    text: 'Strings of length 100.'
  }, {
    id: '500',
    name: '500 characters',
    text: 'Strings of length 500.'
  }, {
    id: '1000',
    name: '1000 characters',
    text: 'Strings of length 1000.'
  }, {
    id: '1500',
    name: '1500 characters',
    text: 'Strings of length 1500.'
  }, {
    id: '2000',
    name: '2000 characters',
    text: 'Strings of length 2000.'
  }, {
    id: '3000',
    name: '3000 characters',
    text: 'Strings of length 3000.'
  }];

  const NUMS = [{
    id: '10',
    name: '10 tests',
    text: 'Run 10 tests.'
  }, {
    id: '20',
    name: '10 tests',
    text: 'Run 10 tests.'
  }, {
    id: '30',
    name: '30 tests',
    text: 'Run 30 tests.'
  }, {
    id: '40',
    name: '40 tests',
    text: 'Run 40 tests.'
  }, {
    id: '50',
    name: '50 tests',
    text: 'Run 50 tests.'
  }];

  const FROMS = [{
    id: 'auto',
    name: 'auto',
    text: 'auto',
  }, {
    id: 'seed',
    name: 'seed',
    text: 'seed',
  }, {
    id: 'user',
    name: 'user',
    text: 'user',
  }];

  // calculate normalization coefficient numerator
  const norm_coef_num = parseFloat(last(NUMS).id) * parseFloat(last(LENS).id);

  // calculate normalized duration label
  const norm_label = (() => {
    const num = parseInt(last(NUMS).id, 10);
    const len = parseInt(last(LENS).id, 10);

    return `
      Normalized mean duration (~μs/test for ${num} strings of length ${len}).
    `.trim();
  })();

  // escape value as csv cell
  const csv_esc = v => `"${v.toString().replaceAll('"', '""')}"`;

  const CSV_COLS = [{
    name: 'ID',
    get: row => row.data.test,
  }, {
    name: 'Time',
    get: row => row.mean,
  }, {
    name: 'Norm Time',
    get: row => row.norm_mean,
  }, {
    name: 'Length',
    get: row => row.data.len,
  }, {
    name: 'Count',
    get: row => row.data.num,
  }, {
    name: 'Source',
    get: row => row.data.from,
  }];

  return Object.freeze({
    tests: TESTS,
    lens: LENS,
    nums: NUMS,
    froms: FROMS,

    pick: pick,
    last: last,
    qs: qs,
    qsa: qsa,

    h0: h0,
    h1: h1,
    h2: h2,
    h3: h3,
    h4: h4,
    h5: h5,
    h6: h6,
    // hd: hd,
    h: h6,

    norm_coef_num: norm_coef_num,
    norm_label: norm_label,

    csv_cols: CSV_COLS,
    csv_esc: csv_esc,
  });
})();
