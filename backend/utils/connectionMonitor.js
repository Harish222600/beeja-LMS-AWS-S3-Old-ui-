const mongoose = require('mongoose');
const { getConnectionStatus, isConnected } = require('../config/database');

class ConnectionMonitor {
    constructor() {
        this.monitoringInterval = null;
        this.isMonitoring = false;
        this.connectionHistory = [];
        this.maxHistorySize = 100;
    }

    // Start monitoring the database connection
    startMonitoring(intervalMs = 30000) { // Default: 30 seconds
        if (this.isMonitoring) {
            console.log('🔍 Connection monitoring is already running');
            return;
        }

        console.log(`🔍 Starting database connection monitoring (interval: ${intervalMs}ms)`);
        this.isMonitoring = true;

        this.monitoringInterval = setInterval(() => {
            this.checkConnection();
        }, intervalMs);

        // Initial check
        this.checkConnection();
    }

    // Stop monitoring
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            this.isMonitoring = false;
            console.log('🛑 Database connection monitoring stopped');
        }
    }

    // Check current connection status
    checkConnection() {
        const status = getConnectionStatus();
        const connected = isConnected();
        const timestamp = new Date().toISOString();

        const connectionInfo = {
            timestamp,
            connected,
            ...status
        };

        // Add to history
        this.addToHistory(connectionInfo);

        // Log if there's a state change
        const lastEntry = this.connectionHistory[this.connectionHistory.length - 2];
        if (!lastEntry || lastEntry.connected !== connected) {
            if (connected) {
                console.log(`✅ [${timestamp}] Database connection restored - State: ${status.state}`);
            } else {
                console.error(`❌ [${timestamp}] Database connection lost - State: ${status.state}`);
            }
        }

        return connectionInfo;
    }

    // Add connection info to history
    addToHistory(connectionInfo) {
        this.connectionHistory.push(connectionInfo);
        
        // Keep history size manageable
        if (this.connectionHistory.length > this.maxHistorySize) {
            this.connectionHistory.shift();
        }
    }

    // Get connection statistics
    getConnectionStats() {
        if (this.connectionHistory.length === 0) {
            return {
                totalChecks: 0,
                connectedChecks: 0,
                disconnectedChecks: 0,
                uptime: 0,
                lastCheck: null,
                currentStatus: getConnectionStatus()
            };
        }

        const totalChecks = this.connectionHistory.length;
        const connectedChecks = this.connectionHistory.filter(entry => entry.connected).length;
        const disconnectedChecks = totalChecks - connectedChecks;
        const uptime = totalChecks > 0 ? (connectedChecks / totalChecks) * 100 : 0;
        const lastCheck = this.connectionHistory[this.connectionHistory.length - 1];

        return {
            totalChecks,
            connectedChecks,
            disconnectedChecks,
            uptime: Math.round(uptime * 100) / 100, // Round to 2 decimal places
            lastCheck,
            currentStatus: getConnectionStatus(),
            isMonitoring: this.isMonitoring
        };
    }

    // Get recent connection history
    getRecentHistory(limit = 10) {
        return this.connectionHistory.slice(-limit);
    }

    // Get connection events (state changes)
    getConnectionEvents() {
        const events = [];
        
        for (let i = 1; i < this.connectionHistory.length; i++) {
            const current = this.connectionHistory[i];
            const previous = this.connectionHistory[i - 1];
            
            if (current.connected !== previous.connected) {
                events.push({
                    timestamp: current.timestamp,
                    event: current.connected ? 'connected' : 'disconnected',
                    previousState: previous.state,
                    newState: current.state
                });
            }
        }
        
        return events;
    }

    // Test database connectivity
    async testConnection() {
        try {
            console.log('🧪 Testing database connection...');
            
            // Try a simple operation
            const result = await mongoose.connection.db.admin().ping();
            
            if (result.ok === 1) {
                console.log('✅ Database ping successful');
                return {
                    success: true,
                    message: 'Database connection is healthy',
                    ping: result,
                    status: getConnectionStatus()
                };
            } else {
                console.log('❌ Database ping failed');
                return {
                    success: false,
                    message: 'Database ping failed',
                    ping: result,
                    status: getConnectionStatus()
                };
            }
        } catch (error) {
            console.error('❌ Database connection test failed:', error.message);
            return {
                success: false,
                message: 'Database connection test failed',
                error: error.message,
                status: getConnectionStatus()
            };
        }
    }

    // Get detailed connection report
    getDetailedReport() {
        const stats = this.getConnectionStats();
        const events = this.getConnectionEvents();
        const recentHistory = this.getRecentHistory(5);

        return {
            monitoring: {
                isActive: this.isMonitoring,
                intervalMs: this.monitoringInterval ? 30000 : null
            },
            statistics: stats,
            recentEvents: events.slice(-5),
            recentHistory,
            recommendations: this.getRecommendations(stats)
        };
    }

    // Get recommendations based on connection stats
    getRecommendations(stats) {
        const recommendations = [];

        if (stats.uptime < 95 && stats.totalChecks > 10) {
            recommendations.push('Connection stability is below 95%. Consider checking network connectivity or MongoDB server health.');
        }

        if (stats.disconnectedChecks > 5) {
            recommendations.push('Multiple disconnections detected. Consider implementing connection pooling or checking for network issues.');
        }

        if (!stats.currentStatus || stats.currentStatus.state === 'disconnected') {
            recommendations.push('Database is currently disconnected. Check MongoDB server status and network connectivity.');
        }

        if (recommendations.length === 0) {
            recommendations.push('Connection appears stable. No immediate action required.');
        }

        return recommendations;
    }
}

// Create singleton instance
const connectionMonitor = new ConnectionMonitor();

module.exports = {
    ConnectionMonitor,
    connectionMonitor
};
