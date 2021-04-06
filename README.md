# autobench

[![NPM version](https://img.shields.io/npm/v/autobench.svg?style=flat)](https://www.npmjs.com/package/autobench)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

Automated benchmark avoiding regression in HTTP Applications.

Wrap [`autocannon`](https://github.com/mcollina/autocannon) and [`autocannon-compare`](https://github.com/mcollina/autocannon-compare) in a box to automatize and monitor HTTP routes.

## Installation

This is a Node.js module available through the npm registry. It can be installed using the `npm` or `yarn` command line tools.

```sh
npm i autobench
```

or globally

```sh
npm i -g autobench
```

## Usage

```sh
autobench
# or directly
npx autobench
```

Add environment `DEBUG=autobench:*` to see the log applications. Example:

```sh
DEBUG=autobench:debug autobench compare
DEBUG=autobench:info autobench compare
DEBUG=autobench:* autobench compare
```

### Config file

In order to use the `autobench`, the project **must** have a `autobench.yml` as config file.

The config file parameters are described bellow:

```yaml
# Name of project [OPTIONAL]
name: 'Autobench Example'
# Benchmarking folder to store and retrieve benchmarks. [REQUIRED]
benchFolder: 'bench'
# Root URL to perform the benchmarking. [REQUIRED]
url: 'http://localhost:3000'
# Group of routes to perform benchmarking. [REQUIRED]
benchmarks:
  # Benchmark route name. [REQUIRED]
  - name: 'request 1'
  # Route path. [REQUIRED]
    path: '/'

  - name: 'request 2'
    path: '/slow'
```

See [`autobench.yml`](./autobench.yml) file to examples.

### Compare

Command to perform benchmark and compare to the stored benchmark.
It's required to have a previous benchmark stored in the `benchFolder`. See [Autobench Create](#create) to realize it.

Options:

| Option | Description | Full command |
| - | - | - |
| -s | When is identified a Performance Regression a `autobench-review.md` file is created with the summary | autobench compare -s |

```sh
autobench compare [-s]
```

The `autobench-review.md` looks like:

```md
## Performance Regression ⚠️

---
The previous benchmark for request-1 was significantly performatic than from this PR.

- **Router**: request-1
- **Requests Diff**: 10%
- **Throughput Diff**: 10%
- **Latency Diff**: 10%

---
The previous benchmark for request-2 was significantly performatic than from this PR.

- **Router**: request-2
- **Requests Diff**: 20%
- **Throughput Diff**: 20%
- **Latency Diff**: 20%
```

### Create

Command to store/override the results in the `benchFolder`.
Usually, it should be used to update the to latest benchmarking result, for instance, after each PR merged.

```sh
autobench create
```

## Examples

See [autobench-example](https://github.com/RafaelGSS/autobench-example) for further details.
