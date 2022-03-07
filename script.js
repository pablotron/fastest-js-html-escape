(() => {
  "use strict";

  // get shared functions
  const {qs, qsa, h, pick, last} = FNS;

  // templates
  const T = Object.freeze({
    option: ({id, name, text}) => `
      <option
        title='${h(text.trim())}'
        aria-label='${h(text.trim())}'
        value='${h(id)}'
      >${h(name)}</option>
    `,

    filter_option: ({id, name, text}) => `
      <option
        title='${h(text.trim())}'
        aria-label='${h(text.trim())}'
        value='${h(id)}'
      >${h(id)}</option>
    `,

    row: ({data, mean, norm_mean}) => `
      <tr>
        <td
          title='Benchmark ID'
          aria-label='Benchmark ID'
        >${h(data.test)}</td>

        <td
          class='right'
          title='Mean duration (μs).'
          aria-label='Mean duration (μs).'
        >${h(mean.toFixed(3))}</td>

        <td
          class='right'
          title='${h(FNS.norm_label)}'
          aria-label='${h(FNS.norm_label)}'
        >${h(norm_mean.toFixed(3))}</td>

        <td
          class='right'
          title='Test string size (bytes).'
          aria-label='Test string size (bytes).'
        >${h('' + data.len)}</td>

        <td
          class='right'
          title='Number of tests.'
          aria-label='Number of tests.'
        >${h('' + data.num)}</td>

        <td
          class='right'
          title='Test source (one of "auto", "seed", or "user").'
          aria-label='Test source (one of "auto", "seed", or "user").'
        >${h(data.from)}</td>
      </tr>
    `,
  });

  // create benchmark result table body HTML
  const make_table = (rows, fs) => rows.filter(row => Object.keys(fs).every(
    id => (fs[id] === 'all') || (('' + row.data[id]) === fs[id])
  )).map(row => T.row(row)).join('');

  // trigger custom event on elements matching selector
  const trigger = (sel, type, data) => qsa(sel).forEach(
    el => el.dispatchEvent(new CustomEvent(type, data))
  );

  // get benchmark result filters
  const get_result_filters = () => qsa('.result-filter').reduce((r, el) => {
    r[el.dataset.id] = el.value;
    return r;
  }, {});

  document.addEventListener('DOMContentLoaded', () => {
    let results = [];

    // set title and aria-label for normalized time column header
    (() => {
      const el = qs('#norm-header');
      ['title', 'aria-label'].forEach(s => el[s] = FNS.norm_label);
    })();

    // populate benchmark parameter and result filter selects
    qsa('.bench-param').forEach((el) => {
      const rows = FNS[el.dataset.id + 's'];
      el.innerHTML = rows.map(row => T.option(row)).join('');
    });

    // populate result filter selects
    qsa('.result-filter').forEach((() => {
      const ALL = { id: 'all', name: 'all', text: 'all' };
      return (el) => {
        const rows = [ALL].concat(FNS[el.dataset.id + 's'])
        el.innerHTML = rows.map(row => T.filter_option(row)).join('');
      };
    })());

    let auto_mutex = false;
    // init worker
    const worker = new Worker('worker.js');
    worker.onmessage = (e) => {
      if (e.data.data.from === 'auto') {
        // clear auto mutex
        auto_mutex = false;
      }

      results.unshift(e.data);
      trigger('#bench-results tbody', 'refresh');
    };

    // declare run()
    const run = (data) => worker.postMessage({
      from: data.from,
      test: data.test,
      len: parseInt(data.len, 10),
      num: parseInt(data.num, 10),
    });

    // seed results for all tests to invoke JIT
    FNS.tests.forEach(({id}) => void run({
      from: 'seed',
      test: id,
      len:  last(FNS.lens).id,
      num:  last(FNS.nums).id,
    }));

    // queue auto test every 100ms if auto is enabled and mutex is
    // unlocked
    setInterval((() => {
      // cache auto toggle, param selects, and rand toggles
      const els = qsa('.bench-param, .bench-rand-toggle').reduce((r, el) => {
        r[el.dataset.kind][el.dataset.id] = el;
        return r;
      }, { auto: qs('#bench-auto'), user: {}, rand: {} });

      return () => {
        if (els.auto.checked && !auto_mutex) {
          // lock auto mutex
          auto_mutex = true;

          // run test
          run(Object.keys(els.rand).reduce((r, id) => {
            const list = FNS[id + 's'];
            r[id] = els.rand[id].checked ? pick(list).id : els.user[id].value;
            return r;
          }, { from: 'auto' }));
        }
      };
    })(), 100);

    // bind to refresh event
    (() => {
      // cache table body
      const el = qs('#bench-results tbody');

      // bind to refresh event
      el.addEventListener('refresh', () => {
        el.innerHTML = make_table(results, get_result_filters());
        return false;
      }, false);
    })();

    // bind to change event
    qsa('.result-filter').forEach(el => el.addEventListener('change', () => {
      setTimeout(() => trigger('#bench-results tbody', 'refresh'), 10);
    }));

    // bind to #run-benchmark click
    qs('#run-benchmark').addEventListener('click', (() => {
      // cache elements
      const els = qsa('.bench-param').reduce((r, el) => {
        r[el.dataset.id] = el;
        return r;
      }, {});

      return () => run(Object.keys(els).reduce((r, id) => {
        r[id] = els[id].value;
        return r;
      }, { from: 'user' }));
    })());

    // bind to #download click
    (() => {
      const el = qs('#download');
      const [cols, esc] = [FNS.csv_cols, FNS.csv_esc];

      const get_href = () => 'data:text/csv,' + encodeURIComponent(
        [cols.map(({name}) => esc(name)).join(',')].concat(
          results.map(row => cols.map(({get}) => esc(get(row))).join(','))
        ).join("\r\n")
      );

      el.addEventListener('click', () => void(el.href = get_href()));
    })()
  });
})();
