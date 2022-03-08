#!/usr/bin/env ruby
# frozen_string_literal: true

#
# gen.rb: generate out/sizes.svg and out/times.svg.
#

# plots
PLOTS = [{
  cmd: 'plot-line.py',
  dst: 'sizes.svg',
}, {
  cmd: 'plot-barh.py',
  dst: 'times.svg',
}]

MINIFY_CMD = %w{/usr/bin/minify --mime image/svg+xml}
AGG_CMD = [File.join(__dir__, 'agg.rb')]

def gen(dst_path, plot_cmd, src_path)
  ths = []
  pids = []
  
  dst_rd, dst_wr = IO.pipe
  ths << Thread.new(dst_rd, dst_path) do |rd, path| 
    pids << spawn(*MINIFY_CMD, in: rd, out: path)
  end

  tmp_rd, tmp_wr = IO.pipe
  ths << Thread.new(tmp_rd, dst_wr) do |rd, wr| 
    pids << spawn(*[File.join(__dir__, plot_cmd)], in: rd, out: wr)
  end

  src_rd, src_wr = IO.pipe
  ths << Thread.new(src_rd, tmp_wr) do |rd, wr| 
    pids << spawn(*AGG_CMD, in: rd, out: wr)
  end

  ths << Thread.new(src_path, src_wr) do |path, wr|
    IO.copy_stream(path, wr)
  end

  # return threads and pids
  [ths, pids]
end

# check cli arg
raise "Usage: #$0 results.csv" unless ARGV.size == 1
SRC_PATH = ARGV.shift

# run commands in threads, join threads
fs = PLOTS.each.with_object({ ths: [], pids: [] }) do |row, r|
  dst_path = File.join(__dir__, '..', 'out', row[:dst])
  ths, pids = gen(dst_path, row[:cmd], SRC_PATH)
  r[:ths].concat(ths)
  r[:pids].concat(pids)
end

fs[:ths].each { |th| th.join }
fs[:pids].each { process.wait(pid) }
