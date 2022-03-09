#!/usr/bin/env ruby
# frozen_string_literal: true

#
# gen.rb: Generate out/sizes.svg and out/times.svg from results.csv.
#
# Example:
#
#   # create out/sizes.svg and out/times.svg from results.csv
#   $ bin/gen.rb results.csv
#

module SvgGen
  # SVG file names and the command to generate them
  SVGS = [{
    cmd: 'plot-line.py',
    dst: 'sizes.svg',
  }, {
    cmd: 'plot-barh.py',
    dst: 'times.svg',
  }]

  # svg minification command
  # (note: have to pass --mime because this is used as an intermediate
  # pipe rather than reading to or writing from an explicit path)
  MINIFY_CMD = %w{/usr/bin/minify --mime image/svg+xml}

  # svg minification command if minify is missing
  NO_MINIFY_CMD = %w{cat}

  #
  # Get full minify command.
  #
  def self.get_minify_cmd
    ok = File.executable?(MINIFY_CMD.first)
    ok ? MINIFY_CMD : NO_MINIFY_CMD
  end

  # absolute path to agg.rb script
  AGG_CMD = [File.join(__dir__, 'agg.rb')]

  #
  # Join given threads, wait on given processes.
  #
  class Fence
    def initialize
      @ths = []
      @pids = []
    end

    #
    # Add threads and pids, return self
    #
    def add(ths, pids)
      # append threads
      @ths.concat(ths)

      # append pids
      @pids.concat(pids)

      nil
    end

    #
    # Join given threads, wait on given processes.
    #
    def wait
      # join threads
      @ths.each { |th| th.join }

      # wait on processes
      @pids.each { process.wait(pid) }

      nil
    end
  end

  #
  # Spawn processes to generate SVG with given plot command from raw
  # results in src_path.
  #
  # Returns threads and PIDs for background task.
  #
  def self.gen(fence, dst_path, plot_cmd, src_path)
    # threads and process IDs
    ths = []
    pids = []

    # spawn minify command in thread which reads from stdin and writes
    # to destination path, capture minify stdin, pid, and thread
    dst_rd, dst_wr = IO.pipe
    ths << Thread.new(dst_rd, dst_path) do |rd, path|
      pids << spawn(*get_minify_cmd, in: rd, out: path)
    end

    # spawn plot pipe command in thread, connect stdout to minify stdin,
    # capture plot stdin, pid, and thread
    tmp_rd, tmp_wr = IO.pipe
    ths << Thread.new(tmp_rd, dst_wr) do |rd, wr|
      pids << spawn(*[File.join(__dir__, plot_cmd)], in: rd, out: wr)
    end

    # spawn agg.rb pipe command in thread, connect stdout to plot
    # command stdin, capture agg.rb stdin, pid, and thread
    src_rd, src_wr = IO.pipe
    ths << Thread.new(src_rd, tmp_wr) do |rd, wr|
      pids << spawn(*AGG_CMD, in: rd, out: wr)
    end

    # copy src_path to agg.rb stdin in thread, capture thread
    ths << Thread.new(src_path, src_wr) do |path, wr|
      IO.copy_stream(path, wr)
    end

    # add threads and pids to fence
    fence.add(ths, pids)
  end

  #
  # cli entry point
  #
  def self.run(app, args)
    # check arg
    raise "Usage: #$0 results.csv" unless args.size == 1
    src_path = args.shift

    # create fence
    fence = Fence.new

    # run generate commands
    SVGS.each do |row|
      # build destination path
      dst_path = File.join(__dir__, '..', 'out', row[:dst])

      # run commands to generate svg, get threads and pids
      gen(fence, dst_path, row[:cmd], src_path)
    end

    # wait for everything to complete
    fence.wait
  end
end

# allow cli invocation
SvgGen.run($0, ARGV) if __FILE__ == $0
