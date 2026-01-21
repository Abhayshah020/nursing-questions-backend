const WINDOW_MS = 10 * 1000; // 10 seconds
const MAX_REQUESTS = 30;

const ipStore = new Map();

export function rateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();

    const record = ipStore.get(ip);

    // First request from IP
    if (!record) {
        ipStore.set(ip, {
            count: 1,
            startTime: now
        });
        return next();
    }

    // Reset window if time expired
    if (now - record.startTime > WINDOW_MS) {
        ipStore.set(ip, {
            count: 1,
            startTime: now
        });
        return next();
    }

    // Block if limit exceeded
    if (record.count >= MAX_REQUESTS) {
        return res.status(429).json({
            message: "Too many requests. Please try again after 10 seconds."
        });
    }

    // Increase count
    record.count += 1;
    ipStore.set(ip, record);

    next();
}