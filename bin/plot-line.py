#!/usr/bin/python3

#
# plot-line.py: Plot of benchmark results for several JavaScript HTML
# escape implementations on a variety of string sizes.
#
# Reads aggregate CSV from standard input and writes SVG plot of results
# to standard output.
#
# You can set the scale of the output SVG using the first command-line
# argument (optional, defaults to 1.5 if unspecified).
#

import csv
import sys
import math
import matplotlib.pyplot as plt
import scipy.stats as st

# plots
# https://matplotlib.org/3.3.4/api/_as_gen/matplotlib.pyplot.plot.html#matplotlib.pyplot.plot
TESTS = {
  'h0': {
    'name': 'h0: Reduce',
    'fmt': 'r.-',
  },

  'h1': {
    'name': 'h1: Reduce, Frozen Array',
    'fmt': 'g.-',
  },

  'h2': {
    'name': 'h2: Match, Capture',
    'fmt': 'b.-',
  },

  'h3': {
    'name': 'h3: Match, Capture, Frozen',
    'fmt': 'c.-',
  },

  'h4': {
    'name': 'h4: Match, No Capture',
    'fmt': 'm.-',
  },

  'h5': {
    'name': 'h5: Match, No Capture, Frozen Map',
    'fmt': 'r,--',
  },

  'h6': {
    'name': 'h6: Match, No Capture, Frozen Map/Function',
    'fmt': 'g,--',
  },

  'h7': {
    'name': 'h7: Reduce, Replace All',
    'fmt': 'b,--',
  },

  'h8': {
    'name': 'h8: Reduce, Replace All, Frozen',
    'fmt': 'c,--',
  },

  'h9': {
    'name': 'h9: Replace All Literal',
    'fmt': 'm,--',
  },
}

# individual statistics row
class Row:
  """individual statistic row"""

  def __init__(self, row):
    """create result from row"""
    self.name = row['name']
    self.len = int(row['length'])
    self.mean = float(row['mean'])
    self.stddev = float(row['stddev'])
    self.sample_mean = float(row['sample_mean'])
    self.sample_stddev = float(row['sample_stddev'])
    self.median = float(row['median'])
    self.min = float(row['min'])
    self.max = float(row['max'])
    self.size = int(row['num_samples'])

#
# data set
#
class Set:
  """data set"""

  def __init__(self, test_id):
    """create data set"""
    self.test_id = test_id
    self.rows = []

  def add(self, x, y, err):
    """add point"""
    self.rows.append({ 'x': x, 'y': y, 'e': err })

  def plot(self, fmt):
    """plot data set"""

    # rows = sorted(self.rows, key = 'x')
    x = [row['x'] for row in self.rows]
    y = [row['y'] for row in self.rows]
    e = [row['e'] for row in self.rows]

    # plt.plot(x, y, fmt, label = self.name)
    plt.errorbar(x, y, 
      yerr = e,
      fmt = fmt,
      label = TESTS[self.test_id]['name'],
      capsize = 3,
      alpha = 0.5,
    )

# read rows
rows = [Row(row) for row in csv.DictReader(sys.stdin)]

# init sets
sets = {}
for row in rows:
  if row.name not in sets:
    sets[row.name] = Set(row.name)

  # calculate stderr and CI from stderr
  ci = 1.96 * row.sample_stddev / math.sqrt(row.size)
  sets[row.name].add(row.len, row.mean, ci)

# get scale from cli, or default to 1.5
# (3.0 is recommended for a HD image)
scale = 1.5
if len(sys.argv) > 1:
  scale = float(sys.argv[1])

plt.figure(figsize=(6.4 * scale, 4.8 * scale))
# plot sets
for k, s in sets.items():
  s.plot(TESTS[k]['fmt'])

# configure plot
# plt.xscale('log')
# plt.yscale('log')
plt.xlabel('String Length')
plt.ylabel('Call Time (μs)')
plt.title('String Length vs Call Time (μs)')
plt.legend(loc='upper left')

# save image
plt.savefig(sys.stdout.buffer, format = 'svg')
