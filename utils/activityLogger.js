class ActivityLogger {
    static async logActivity(userId, action, details) {
        const activity = new ActivityLog({
            userId,
            action,
            details,
            timestamp: new Date(),
            ipAddress: req.ip
        });
        await activity.save();
    }

    static async getRecentActivity(userId, limit = 10) {
        return await ActivityLog.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit);
    }
}

module.exports = ActivityLogger;
