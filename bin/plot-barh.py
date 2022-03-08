#!/usr/bin/python3

#
# plot-barh.py: Plot horizontal bars of benchmark results for several
# JavaScript HTML escape implementations on randomly generated 3000
# character long strings.
#
# Reads aggregate CSV from standard input and writes SVG plot of results
# to standard output.
#

import csv
import sys
import math
import json
import os.path as path
import matplotlib.pyplot as plt
import numpy as np

# read tests from ./tests.json
#
# mathplotlib format string documentation:
# https://matplotlib.org/3.3.4/api/_as_gen/matplotlib.pyplot.plot.html#matplotlib.pyplot.plot
with open(path.join(path.dirname(sys.argv[0]), "tests.json"), 'rb') as f:
  TESTS = json.load(f)

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

  def __init__(self):
    """create data set"""
    self.rows = []

  def add(self, test_id, y, err):
    """add point"""
    self.rows.append({ 'id': test_id, 'y': y, 'e': err })

  def plot(self):
    """plot data set"""

    min_y = min([row['y'] for row in self.rows])
    max_y = max([row['y'] for row in self.rows])

    plt.barh(
      np.arange(len(self.rows)),
      [row['y'] for row in self.rows],
      tick_label = [row['id'] for row in self.rows],
      xerr = [row['e'] for row in self.rows],
      color = [self.get_color(row['y'], min_y, max_y) for row in self.rows],
      capsize = 2,
      alpha = 0.5,
      align = 'center',
    )

  def get_color(self, y, min_y, max_y):
    """Get color"""

    # get percent
    p = ((y - min_y) / (max_y - min_y))

    if p < 0.05:
      return 'g' # y E [0, 5%]
    elif p > 0.80:
      return 'r' # y E [80%, 100%]
    else:
      return 'C0' # default

# read rows (reversed)
rows = reversed([Row(row) for row in csv.DictReader(sys.stdin) if row['length'] == '3000'])

# init data set
ds = Set()
for row in rows:
  # calculate stderr and CI from stderr
  ci = 1.96 * row.sample_stddev / math.sqrt(row.size)
  ds.add(row.name, row.sample_mean, ci)

# get scale from cli, or default to 1.5
# (3.0 is recommended for a HD image)
scale = 1.5
if len(sys.argv) > 1:
  scale = float(sys.argv[1])

plt.figure(figsize=(6.4 * scale, 4.8 * scale))

# plot dataset
ds.plot()

# configure plot
plt.ylabel('HTML Escape Function')
plt.xlabel('Call Time (μs, lower is better)')
plt.title('HTML Escape Function Call Times')
plt.tight_layout()

# save image
plt.savefig(sys.stdout.buffer, format = 'svg')
