const url = process.argv[2] || "http://localhost:3000/api/redis-test"
const count = Number(process.argv[3] || 60)

console.log("========================================")
console.log("          GoalIQ Redis Burst Test")
console.log("========================================")
console.log()
console.log(`URL:      ${url}`)
console.log(`Requests: ${count}`)
console.log()
console.log("Sending requests concurrently...")
console.log()

const start = Date.now()

const responses = await Promise.all(
  Array.from({ length: count }, async (_, index) => {
    const requestStart = Date.now()

    try {
      const response = await fetch(`${url}?request=${index + 1}`)
      const data = await response.json()

      return {
        request: index + 1,
        status: response.status,
        duration: Date.now() - requestStart,
        data,
      }
    } catch (error) {
      return {
        request: index + 1,
        status: "ERROR",
        duration: Date.now() - requestStart,
        error: error.message,
      }
    }
  })
)

const totalDuration = Date.now() - start

console.log("========================================")
console.log("                 RESULTS")
console.log("========================================")
console.log()

const durations = responses
  .filter((r) => typeof r.duration === "number")
  .map((r) => r.duration)

const successful = responses.filter((r) => r.status === 200)

console.log(`Successful: ${successful.length}/${count}`)
console.log(`Min:        ${Math.min(...durations)}ms`)
console.log(`Max:        ${Math.max(...durations)}ms`)
console.log(
  `Average:    ${Math.round(
    durations.reduce((sum, value) => sum + value, 0) / durations.length
  )}ms`
)
console.log(`Total:      ${totalDuration}ms`)
console.log()

console.log("First 20 responses:")

responses.slice(0, 20).forEach((response) => {
  console.log(
    `#${response.request}: status=${response.status} duration=${response.duration}ms`
  )
})

console.log()
console.log("========================================")