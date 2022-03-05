const FNS = (() => {
  "use strict";

  // query selector all
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

  // URL-escape a hash of parameters
  const params = (v = {}) => Object.entries(v).map(
    e => e.map(encodeURIComponent).join('=')
  ).join('&');

  const TESTS = [{
    id: 'h0',
    name: "h0: HTML Escape (Reduce)",
    text: `
      HTML escape with replacement regular expression array.
    `,
  }, {
    id: 'h1',
    name: "h1: HTML Escape (Reduce, Frozen Array)",
    text: `
      HTML escape with frozen replacement regular expression array.
    `,
  }, {
    id: 'h2',
    name: "h2: HTML Escape (Match, Capture)",
    text: `
      HTML escape with capturing regex and replacement entity map.
    `,
  }, {
    id: 'h3',
    name: "h3: HTML Escape (Match, Capture, Frozen)",
    text: `
      HTML escape with capturing regex and frozen replacement entity map.
    `,
  }, {
    id: 'h4',
    name: "h4: HTML Escape (Match, No Capture)",
    text: `
      HTML escape with non-capturing regex and replacement entity map.
    `,
  }, {
    id: 'h5',
    name: "h5: HTML Escape (Match, No Capture, Frozen Map)",
    text: `
      HTML escape with non-capturing regex and frozen replacement entity
      map.
    `,
  }, {
    id: 'h6',
    name: "h6: HTML Escape (Match, No Capture, Frozen Map, Frozen Function)",
    text: `
      HTML escape with non-capturing regex, frozen replacement entity
      map, and frozen function.
    `,
  }];

  const LENGTHS = [{
    id: '10',
    name: '10 characters',
    text: '10 character strings.'
  }, {
    id: '100',
    name: '100 characters',
    text: '100 character strings.'
  }, {
    id: '1000',
    name: '1000 characters',
    text: '1000 character strings.'
  }];

  const NUMS = [{
    id: '100000',
    name: '100,000 tests',
    text: '100,000 tests.'
  }, {
    id: '200000',
    name: '200,000 tests',
    text: '200,000 tests.'
  }, {
    id: '300000',
    name: '300,000 tests',
    text: '300,000 tests.'
  }, {
    id: '400000',
    name: '400,000 tests',
    text: '400,000 tests.'
  }, {
    id: '500000',
    name: '500,000 tests',
    text: '500,000 tests.'
  }];

  return Object.freeze({
    tests: TESTS,
    lens: LENGTHS,
    nums: NUMS,
    qsa: qsa,
    h0: h0,
    h1: h1,
    h2: h2,
    h3: h3,
    h4: h4,
    h5: h5,
    h6: h5,
    // hd: hd,
    params: params,
  });
})();