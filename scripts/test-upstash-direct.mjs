import "dotenv/config"

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

if (!url || !token) {
  console.error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN")
  process.exit(1)
}

async function ping(requestNumber) {
  const start = performance.now()

  try {
    const response = await fetch(`${url}/ping`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    const duration = Math.round(performance.now() - start)

    return {
      request: requestNumber,
      status: response.status,
      result: data.result,
      duration,
    }
  } catch (error) {
    return {
      request: requestNumber,
      status: "ERROR",
      error: error.message,
      duration: Math.round(performance.now() - start),
    }
  }
}

const count = Number(process.argv[2] || 1)

console.log("========================================")
console.log("       Direct Upstash Redis Test")
console.log("========================================")
console.log()
console.log(`Requests: ${count}`)
console.log()
console.log("Testing Upstash directly...")
console.log()

const start = performance.now()

const results = await Promise.all(
  Array.from({ length: count }, (_, index) =>
    ping(index + 1)
  )
)

const totalDuration = Math.round(performance.now() - start)

const successful = results.filter(
  (result) => result.status === 200
)

const durations = successful.map(
  (result) => result.duration
)

console.log("========================================")
console.log("                 RESULTS")
console.log("========================================")
console.log()

console.log(`Successful: ${successful.length}/${count}`)

if (durations.length > 0) {
  console.log(`Min:        ${Math.min(...durations)}ms`)
  console.log(`Max:        ${Math.max(...durations)}ms`)
  console.log(
    `Average:    ${Math.round(
      durations.reduce((sum, value) => sum + value, 0) /
        durations.length
    )}ms`
  )
}

console.log(`Total:      ${totalDuration}ms`)
console.log()

console.log("First 20 responses:")

results.slice(0, 20).forEach((result) => {
  console.log(
    `#${result.request}: status=${result.status} result=${result.result ?? "-"} duration=${result.duration}ms`
  )
})

console.log()
console.log("========================================")