'use strict'

const autocannon = require('autocannon')
const compare = require('autocannon-compare')
const fs = require('fs')

const requestConfig = [
  {
    name: 'request 1',
    url: 'http://localhost:3000/',
    connections: 10,
    duration: 10,
    pipelining: 1,
  },
  {
    name: 'request 2',
    url: 'http://localhost:3000/slow',
    connections: 10,
    duration: 10,
    pipelining: 1,
  }
]

function runBench(config) {
  return new Promise((resolve, reject) => {
    autocannon(config, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

function getPreviousBenchmark(name) {
  try {
    const previous = require(`./bench/${name}.json`)
    return previous
  } catch (e) {
    return undefined
  }
}

function normalizeBenchmarkName(name) {
  return name.replace(/ /g, '-')
}

function compareResults(results) {
  for (const [key, value] of results.entries()) {
    const previousBench = getPreviousBenchmark(key)
    if (previousBench) {
      const comparissonResult = compare(previousBench, value)
      console.info(`Comparisson: ${key}`, comparissonResult)
    } else {
      console.info(`${key} doesn't has a previous benchmark to compare. Skipping.`)
    }
  }
}

function storeResults(results) {
  for (const [key, value] of results.entries()) {
    fs.writeFileSync(`./bench/${key}.json`, JSON.stringify(value, null, 4))
  }
}

async function main(configs) {
  const args = process.argv.slice(2)

  if (args.length !== 1) {
    console.error('Usage: autobench [compare | create]')
    process.exit(1)
  }

  if (args[0] !== 'create' && args[0] !== 'compare') {
    console.error(`Option ${args[0]} not recognized!`)
    process.exit(1)
  }

  const results = new Map()
  for (let instanceCfg of configs) {
    const result = await runBench(instanceCfg)
    results.set(normalizeBenchmarkName(instanceCfg.name), result)
  }

  if (args[0] === 'create') {
    storeResults(results)
  }

  if (args[0] === 'compare') {
    compareResults(results)
  }

  console.info('Done!')
}

main(requestConfig)
