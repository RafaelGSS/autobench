#! /usr/bin/env node

'use strict'

const autocannon = require('autocannon')
const compare = require('autocannon-compare')
const Ajv = require("ajv").default
const yaml = require('js-yaml')
const fs = require('fs')
const ajv = new Ajv()

function runBench(autocannonParams) {
  return new Promise((resolve, reject) => {
    autocannon(autocannonParams, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

function getPreviousBenchmark(benchFolder, name) {
  try {
    const previous = require(`${benchFolder}/${name}.json`)
    return previous
  } catch (e) {
    return undefined
  }
}

function normalizeBenchmarkName(name) {
  return name.replace(/ /g, '-')
}

function compareResults(results, benchFolder) {
  for (const [key, value] of results.entries()) {
    const previousBench = getPreviousBenchmark(benchFolder, key)
    if (previousBench) {
      const comparissonResult = compare(previousBench, value)
      console.info(`Comparisson: ${key}`, comparissonResult)
    } else {
      console.info(`${key} doesn't has a previous benchmark to compare. Skipping.`)
    }
  }
}

function storeResults(results, benchFolder) {
  for (const [key, value] of results.entries()) {
    fs.writeFileSync(`${benchFolder}/${key}.json`, JSON.stringify(value, null, 4))
  }
}

function validateConfig(cfg) {
  const validate = ajv.compile({
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      url: {
        type: 'string',
      },
      benchFolder: {
        type: 'string',
      },
      benchmarks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            path: {
              type: 'string'
            },
          },
          required: ['name', 'path']
        }
      }
    },
    required: ['name', 'benchmarks', 'benchFolder']
  })

  if (validate(cfg)) {
    return cfg
  } else {
    console.error('The autobench config file has errors', validate.errors)
    process.exit(1)
  }
}

function parseConfig() {
  try {
    const cfg = yaml.load(fs.readFileSync('./autobench.yml'))
    if (!cfg.url) {
      if (!process.env.AUTOBENCH_URL) {
        console.error('URL not provided. You should provide the `url` in autobench config or by AUTOBENCH_URL env variable.')
        process.exit(1)
      }
    }

    validateConfig(cfg)
    return cfg
  } catch (e) {
    console.error('Not found `autobench.yml` file.')
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length !== 1) {
    console.error('Usage: autobench [compare | create]')
    process.exit(1)
  }

  if (args[0] !== 'create' && args[0] !== 'compare') {
    console.error(`Option ${args[0]} not recognized!`)
    process.exit(1)
  }

  const config = parseConfig()
  const results = new Map()
  for (let instanceCfg of config.benchmarks) {
    const result = await runBench({
      url: config.url + instanceCfg.path,
      connections: 10,
      pipelining: 1,
      duration: 10
    })
    results.set(normalizeBenchmarkName(instanceCfg.name), result)
  }

  if (args[0] === 'create') {
    storeResults(results, config.benchFolder)
  }

  if (args[0] === 'compare') {
    compareResults(results, config.benchFolder)
  }

  console.info('Done!')
}

main()
