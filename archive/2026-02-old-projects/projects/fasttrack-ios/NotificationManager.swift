import Foundation
import UserNotifications

// MARK: - Notification Manager

class NotificationManager: NSObject, ObservableObject {
    static let shared = NotificationManager()
    
    @Published var notificationPermission: UNAuthorizationStatus = .notDetermined
    
    override init() {
        super.init()
        checkNotificationPermission()
    }
    
    // MARK: - Request Permission
    
    func requestNotificationPermission() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
            
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            
            await checkNotificationPermissionAsync()
            return granted
        } catch {
            print("Error requesting notification permission: \(error)")
            return false
        }
    }
    
    private func checkNotificationPermission() {
        UNUserNotificationCenter.current().getNotificationSettings { [weak self] settings in
            DispatchQueue.main.async {
                self?.notificationPermission = settings.authorizationStatus
            }
        }
    }
    
    private func checkNotificationPermissionAsync() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        DispatchQueue.main.async {
            self.notificationPermission = settings.authorizationStatus
        }
    }
    
    // MARK: - Schedule Daily Reminder
    
    func scheduleDailyReminder(at time: Date, title: String = "FastTrack", body: String = "Ready to start your fast?") async -> Bool {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.hour, .minute], from: time)
        
        var dateComponents = DateComponents()
        dateComponents.hour = components.hour
        dateComponents.minute = components.minute
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
        
        // Add custom data (for smart timing - only notify if no fast logged today)
        content.userInfo = [
            "reminderType": "daily_fast",
            "requiresCheck": true // Check if fast already logged today
        ]
        
        let request = UNNotificationRequest(identifier: "daily_reminder", content: content, trigger: trigger)
        
        do {
            try await UNUserNotificationCenter.current().add(request)
            print("✅ Daily reminder scheduled for \(formatTime(time))")
            return true
        } catch {
            print("Error scheduling reminder: \(error)")
            return false
        }
    }
    
    // MARK: - Cancel Notifications
    
    func cancelDailyReminder() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["daily_reminder"])
        print("Cancelled daily reminder")
    }
    
    // MARK: - Smart Notifications (Only Notify if No Fast Today)
    
    func scheduleSmartReminder(
        at time: Date,
        fastManager: FastManager,
        title: String = "Time to Fast",
        body: String = "Start your fasting window now"
    ) async -> Bool {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.hour, .minute], from: time)
        
        var dateComponents = DateComponents()
        dateComponents.hour = components.hour
        dateComponents.minute = components.minute
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        // Check if fast already logged today
        let hasLogggedToday = fastManager.fasts.contains { fast in
            calendar.isDateInToday(fast.date)
        }
        
        // Only schedule if no fast logged today
        if !hasLogggedToday {
            let request = UNNotificationRequest(identifier: "smart_reminder", content: content, trigger: trigger)
            
            do {
                try await UNUserNotificationCenter.current().add(request)
                print("✅ Smart reminder scheduled (no fast logged today)")
                return true
            } catch {
                print("Error scheduling smart reminder: \(error)")
                return false
            }
        } else {
            print("ℹ️ Fast already logged today - skipping reminder")
            return true
        }
    }
    
    // MARK: - Notification Handling
    
    func setupNotificationHandling() {
        UNUserNotificationCenter.current().delegate = self
    }
    
    // MARK: - Streak Milestone Notifications
    
    func notifyStreakMilestone(streak: Int) async {
        guard streak % 5 == 0 && streak > 0 else { return } // Notify at 5, 10, 15, etc.
        
        let content = UNMutableNotificationContent()
        content.title = "🔥 Milestone Reached!"
        content.body = "You've reached a \(streak)-day streak! Amazing consistency!"
        content.sound = .default
        content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
        
        let request = UNNotificationRequest(identifier: "streak_\(streak)", content: content, trigger: UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false))
        
        do {
            try await UNUserNotificationCenter.current().add(request)
            print("✅ Streak milestone notification sent: \(streak) days")
        } catch {
            print("Error sending milestone notification: \(error)")
        }
    }
    
    // MARK: - Weight Goal Notifications
    
    func notifyWeightGoalReached(currentWeight: Double, goalWeight: Double) async {
        if currentWeight <= goalWeight {
            let content = UNMutableNotificationContent()
            content.title = "🎉 Goal Reached!"
            content.body = "Congratulations! You've reached your weight goal!"
            content.sound = .default
            content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
            
            let request = UNNotificationRequest(identifier: "weight_goal", content: content, trigger: UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false))
            
            do {
                try await UNUserNotificationCenter.current().add(request)
                print("✅ Weight goal notification sent")
            } catch {
                print("Error sending weight goal notification: \(error)")
            }
        }
    }
    
    // MARK: - Helper Functions
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension NotificationManager: UNUserNotificationCenterDelegate {
    
    // Handle notification when app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        let userInfo = notification.request.content.userInfo
        print("Received notification in foreground: \(userInfo)")
        
        // Show notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }
    
    // Handle notification tap/action
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        
        if let reminderType = userInfo["reminderType"] as? String {
            print("User tapped notification: \(reminderType)")
            // Navigate to timer screen when user taps notification
            NotificationCenter.default.post(name: NSNotification.Name("OpenTimerScreen"), object: nil)
        }
        
        completionHandler()
    }
}

// MARK: - Notification Request Builder

struct NotificationRequest {
    let title: String
    let body: String
    let delay: TimeInterval
    let repeats: Bool
    let sound: Bool
    let badge: Bool
    
    func schedule(identifier: String = UUID().uuidString) async throws {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        
        if sound {
            content.sound = .default
        }
        
        if badge {
            content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
        }
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: delay, repeats: repeats)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        
        try await UNUserNotificationCenter.current().add(request)
        print("✅ Notification scheduled: \(identifier)")
    }
}
