#!/usr/bin/env ruby

require 'csv'

module TimingStats
  class Row
    attr :source, :test, :len, :time

    def initialize(row)
      @source = row['Source'].intern
      @test = row['Test'].intern
      @len = row['Length'].to_i
      @time = row['Time'].to_f
    end
  end

  class Set
    attr :test, :len, :times

    def initialize(test, len)
      @test = test
      @len = len
      @times = []
    end

    def stats
      # get sorted values (needed for median, min, and max) size, and
      # unbiased size
      vals = @times.sort
      size = vals.size
      ub_size = size - 1

      # calculate median offset
      median_ofs = (size / 2) + ((size > 2 && size.odd?) ? 1 : 0)

      # calculate median, mean, and stddev
      median = vals[median_ofs]
      mean = vals.map { |v| v / size }.sum
      stddev = Math.sqrt(vals.map { |v| ((v - mean) ** 2) / size }.sum)

      # calculate sample mean and sample stddev
      sample_mean = vals.map { |v| v / size }.sum
      sample_stddev = Math.sqrt(vals.map { |v|
        ((v - sample_mean) ** 2) / ub_size
      }.sum)

      # FIXME: should we chuck outliers based on stddev/iqr and
      # recalculate?

      # return results
      return { 
        size: size,
        mean: mean,
        median: median,
        stddev: stddev,
        sample_mean: sample_mean,
        sample_stddev: sample_stddev,
        min: vals[0],
        max: vals[-1],
      }
    end

    def <=>(b)
      (self.test == b.test) ? self.len <=> b.len : self.test <=> b.test
    end
  end

  module CSVReader
    def self.run(io)
      CSV(STDIN, headers: true).map { |row|
        Row.new(row)
      }.select { |row|
        row.source == :auto
      }
    end
  end

  module StatsCSVWriter
    COLS = [{
      dst: 'name',
      get: proc { |set, stats| set.test },
    }, {
      dst: 'length',
      get: proc { |set, stats| set.len },
    }, {
      dst: 'mean',
      get: proc { |set, stats| stats[:mean].round(3) },
    }, {
      dst: 'stddev',
      get: proc { |set, stats| stats[:stddev].round(3) },
    }, {
      dst: 'sample_mean',
      get: proc { |set, stats| stats[:sample_mean].round(3) },
    }, {
      dst: 'sample_stddev',
      get: proc { |set, stats| stats[:sample_stddev].round(3) },
    }, {
      dst: 'median',
      get: proc { |set, stats| stats[:median].round(3) },
    }, {
      dst: 'min',
      get: proc { |set, stats| stats[:min].round(3) },
    }, {
      dst: 'max',
      get: proc { |set, stats| stats[:max].round(3) },
    }, {
      dst: 'num_samples',
      get: proc { |set, stats| stats[:size] },
    }].freeze

    def self.run(io, sets)
      CSV(io) do |csv|
        csv << COLS.map { |col| col[:dst] }
        sets.sort.each do |set|
          stats = set.stats
          csv << COLS.map { |col| col[:get].call(set, stats) }
        end
      end
    end
  end

  def self.run(app, args)
    # read rows from standard input
    rows = CSVReader.run(STDIN)
    
    # group by tests
    sets = rows.each.with_object({}) do |row, r|
      id = "#{row.test}-#{row.len}".intern
      r[id] ||= Set.new(row.test, row.len)
      r[id].times << row.time
    end.values
    
    # print stats to stdout
    StatsCSVWriter.run(STDOUT, sets)
  end
end

TimingStats.run($0, ARGV) if $0 == __FILE__
