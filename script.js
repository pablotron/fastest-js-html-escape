(() => {
  "use strict";

  // html escape
  const qsa = FNS.qsa;
  const h = FNS.h1;

  // convert string to upper case
  const uc = (s) => s.toUpperCase();

  // trim string, compact whitespace
  const pack = (s) => s.trim().replace(/\s+/, ' ');

  // templates
  const T = {
    hi: (s) => `
      hello ${h(uc(s))}!
    `,

    // template w/destructuring
    sup: ({first, last}) => `
      sup ${h(uc(last))}, ${h(first)}!
    `,

    option: ({id, name, text}) => `
      <option
        title='${h(text.trim())}'
        aria-label='${h(text.trim())}'
        value='${h(id)}'
      >${h(name)}</option>
    `,

    row: ({data, mean}) => `
      <tr>
        <td
          title='Benchmark ID'
          aria-label='Benchmark ID'
        >${h(data.test)}</td>

        <td
          title='Average test duration (ms).'
          aria-label='Average test duration (ms).'
        >${h('' + mean)}</td>

        <td
          title='Test string size (bytes).'
          aria-label='Test string size (bytes).'
        >${h('' + data.len)}</td>

        <td
          title='Number of tests.'
          aria-label='Number of tests.'
        >${h('' + data.num)}</td>

        <td
          title='Test source (one of "user" or "auto").'
          aria-label='Test source (one of "user" or "auto").'
        >${h(data.from)}</td>
      </tr>
    `,
  };

  let results = [];
  // create benchmark result row element (tr)
  const make_table = (rows) => {
    return rows.map((row) => T.row(row)).join('');
  }

  // pick random element of array
  const pick = (ary) => ary[Math.floor(Math.random() * ary.length)];

  // trigger custom event on elements matching selector
  const trigger = (sel, type, data) => {
    return qsa(sel).map((el) => {
      const ev = new CustomEvent(type, data);
      el.dispatchEvent(ev);
      return ev;
    });
  };

  // multiline string test
  const name = `paul<>\'"&
  duncan<>&\'`;
  document.addEventListener('DOMContentLoaded', () => {
    // populate benchmark parameter selects
    qsa('.bench-param').forEach((el) => {
      const rows = FNS[el.dataset.id + 's'];
      el.innerHTML = rows.map(row => T.option(row)).join('');
    });

    // init worker
    const worker = new Worker('worker.js');
    worker.onmessage = (() => {
      const el = qsa('#bench-results tbody')[0];

      return (e) => {
        console.log(e.data);
        results.unshift(e.data);
        trigger('#bench-results tbody', 'refresh');
      };
    })();

    // declare run()
    const run = (data) => void worker.postMessage({
      from: data.from,
      test: data.test,
      len: parseInt(data.len, 10),
      num: parseInt(data.num, 10),
    });

    // seed results for all tests to invoke JIT
    FNS.tests.forEach(({id}) => void run({
      from: 'seed',
      test: id,
      len:  FNS.lens[FNS.lens.length - 1].id,
      num:  FNS.nums[FNS.nums.length - 1].id,
    }));

    // automatically run test every 5 seconds
    setInterval((() => {
      // cache auto toggle
      const auto = qsa('#bench-auto')[0];

      // cache elements
      const els = qsa('.bench-param, .bench-rand-toggle').reduce((r, el) => {
        r[el.dataset.kind][el.dataset.id] = el;
        return r;
      }, { user: {}, rand: {} });

      return () => {
        if (!auto.checked) {
          return;
        }

        // run benchmark
        run(Object.keys(els.rand).reduce((r, id) => {
          const list = FNS[id + 's'];
          r[id] = els.rand[id].checked ? pick(list).id : els.user[id].value;
          return r;
        }, { from: 'auto' }));
      };
    })(), 5000);

    // test templates
    qsa('#greeting-hi')[0].innerHTML = T.hi(name);
    qsa('#greeting-sup')[0].innerHTML = T.sup({ first: 'paul', last: 'duncan'});
    qsa('#uri')[0].innerText = FNS.params({
      foo: '<>@#$',
      bar: 'barldkasjkl',
      '!<> ': 'b z+=?',
    });

    (() => {
      // cache table body
      const el = qsa('#bench-results tbody')[0];

      // bind to refresh event
      el.addEventListener('refresh', () => {
        el.innerHTML = make_table(results);
        return false;
      }, false);
    })();
    
    // bind to click event
    qsa('#run-benchmark')[0].addEventListener('click', (() => {
      // cache elements
      const els = qsa('.bench-param').reduce((r, el) => {
        r[el.dataset.id] = el;
        return r;
      }, {});

      return () => {
        // run benchmark
        run(Object.keys(els).reduce((r, id) => {
          r[id] = els[id].value; 
          return r;
        }, { from: 'user' }));

        // stop event
        return false;
      };
    })());
  });
})();
