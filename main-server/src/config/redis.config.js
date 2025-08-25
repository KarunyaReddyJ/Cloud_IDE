const Redis = require("ioredis")

const redis = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379
})
const sub = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379
})

const WORKSPACE_PREFIX = "workspace:"

async function recordActivity(workspaceId) {
    if (!workspaceId) return
    const now = Date.now()
    const key = WORKSPACE_PREFIX + workspaceId

    const existing = await redis.hgetall(key)
    const suspended = existing?.suspended === "true" || "false"

    await redis.hmset(key, { lastActive: now, suspended })
    await redis.expire(key, 1800) // 30 mins inactivity timeout
}

function subscribeToExpiryEvents(stopAndCleanupContainer) {
    sub.psubscribe("__keyevent@0__:expired", (err) => {
        if (err) console.error("❌ Failed to subscribe:", err)
    })

    sub.on("pmessage", async (pattern, channel, message) => {
        if (message.startsWith(WORKSPACE_PREFIX)) {
            const workspaceId = message.replace(WORKSPACE_PREFIX, "")
            console.log("⚠️ Workspace expired:", workspaceId)

            try {
                await stopAndCleanupContainer(`runtime-${workspaceId}`)
            } catch (err) {
                console.error("Cleanup failed:", err)
            }
        }
    })
}


redis.on("connect", () => console.log("✅ Connected to Redis"))
redis.on("error", (err) => console.error("❌ Redis error:", err))


module.exports = {
    recordActivity,
    subscribeToExpiryEvents
}
