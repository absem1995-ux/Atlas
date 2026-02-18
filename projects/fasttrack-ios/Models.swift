import Foundation

// MARK: - Fasting Protocol
enum FastingProtocol: String, Codable, CaseIterable {
    case sixteen_eight = "16:8"
    case eighteen_six = "18:6"
    case twenty_four = "20:4"
    case omad = "OMAD"
    case custom = "Custom"
    
    var displayName: String { self.rawValue }
    
    var fasting_hours: Int {
        switch self {
        case .sixteen_eight: return 16
        case .eighteen_six: return 18
        case .twenty_four: return 20
        case .omad: return 23
        case .custom: return 16 // default
        }
    }
    
    var eating_hours: Int { 24 - fasting_hours }
}

// MARK: - Fast Log
struct FastLog: Identifiable, Codable {
    let id: String
    let date: Date
    let protocol: FastingProtocol
    let start_time: Date
    let end_time: Date?
    let duration_hours: Double?
    let completed: Bool
    
    var duration_minutes: Int? {
        guard let duration = duration_hours else { return nil }
        return Int(duration * 60)
    }
    
    init(id: String = UUID().uuidString,
         date: Date = Date(),
         protocol: FastingProtocol = .sixteen_eight,
         start_time: Date = Date(),
         end_time: Date? = nil,
         completed: Bool = false) {
        self.id = id
        self.date = date
        self.protocol = `protocol`
        self.start_time = start_time
        self.end_time = end_time
        self.completed = completed
        
        if let endTime = end_time {
            self.duration_hours = endTime.timeIntervalSince(start_time) / 3600
        } else {
            self.duration_hours = nil
        }
    }
}

// MARK: - Weight Log
struct WeightLog: Identifiable, Codable {
    let id: String
    let date: Date
    let weight: Double // in pounds or kg based on user preference
    let notes: String?
    
    init(id: String = UUID().uuidString,
         date: Date = Date(),
         weight: Double,
         notes: String? = nil) {
        self.id = id
        self.date = date
        self.weight = weight
        self.notes = notes
    }
}

// MARK: - User Profile
struct UserProfile: Codable {
    let uid: String
    var goal: String // "weight_loss", "health", "clarity"
    var preferred_protocol: FastingProtocol
    var weight_unit: String // "lbs" or "kg"
    var goal_weight: Double?
    var current_weight: Double?
    var notifications_enabled: Bool
    var notification_time: Date // default 8am
    var email: String
    var created_at: Date
    var updated_at: Date
    
    init(uid: String, email: String) {
        self.uid = uid
        self.email = email
        self.goal = "weight_loss"
        self.preferred_protocol = .sixteen_eight
        self.weight_unit = "lbs"
        self.goal_weight = nil
        self.current_weight = nil
        self.notifications_enabled = true
        self.notification_time = Calendar.current.date(bySettingHour: 8, minute: 0, second: 0, of: Date()) ?? Date()
        self.created_at = Date()
        self.updated_at = Date()
    }
}

// MARK: - Subscription
struct Subscription: Codable {
    let user_id: String
    var is_active: Bool
    var plan: String // "free", "premium"
    var subscription_id: String?
    var start_date: Date
    var end_date: Date?
    var auto_renew: Bool
    
    init(user_id: String, plan: String = "free") {
        self.user_id = user_id
        self.plan = plan
        self.is_active = plan != "free"
        self.subscription_id = nil
        self.start_date = Date()
        self.end_date = nil
        self.auto_renew = false
    }
}

// MARK: - Statistics (for dashboard)
struct FastingStats: Codable {
    let current_streak: Int
    let longest_streak: Int
    let total_fasts_completed: Int
    let average_fasting_duration: Double // in hours
    let weight_change: Double? // current - starting weight
    let consistency_percentage: Double // (completed / total) * 100
    
    static func calculate(fasts: [FastLog], weights: [WeightLog]) -> FastingStats {
        let completed_fasts = fasts.filter { $0.completed }
        let current_streak = calculateStreak(fasts: completed_fasts)
        let longest_streak = calculateLongestStreak(fasts: completed_fasts)
        let total_completed = completed_fasts.count
        let avg_duration = completed_fasts.map { $0.duration_hours ?? 0 }.reduce(0, +) / Double(max(total_completed, 1))
        let consistency = total_completed > 0 ? (Double(total_completed) / Double(fasts.count)) * 100 : 0
        
        let weight_change: Double? = {
            guard let first = weights.sorted(by: { $0.date < $1.date }).first,
                  let last = weights.last else { return nil }
            return last.weight - first.weight
        }()
        
        return FastingStats(
            current_streak: current_streak,
            longest_streak: longest_streak,
            total_fasts_completed: total_completed,
            average_fasting_duration: avg_duration,
            weight_change: weight_change,
            consistency_percentage: consistency
        )
    }
    
    private static func calculateStreak(fasts: [FastLog]) -> Int {
        let sorted = fasts.sorted { $0.date > $1.date }
        var streak = 0
        var current_date = Date()
        
        for fast in sorted {
            let calendar = Calendar.current
            if calendar.isDate(fast.date, inSameDayAs: current_date) {
                streak += 1
                current_date = calendar.date(byAdding: .day, value: -1, to: current_date) ?? current_date
            } else {
                break
            }
        }
        return streak
    }
    
    private static func calculateLongestStreak(fasts: [FastLog]) -> Int {
        let sorted = fasts.sorted { $0.date < $1.date }
        var longest = 0
        var current = 0
        var last_date: Date?
        
        for fast in sorted {
            if let previous = last_date {
                let calendar = Calendar.current
                let next_day = calendar.date(byAdding: .day, value: 1, to: previous)!
                if calendar.isDate(fast.date, inSameDayAs: next_day) {
                    current += 1
                } else {
                    longest = max(longest, current)
                    current = 1
                }
            } else {
                current = 1
            }
            last_date = fast.date
        }
        longest = max(longest, current)
        return longest
    }
}
