import SwiftUI
import FirebaseCore

@main
struct FasttrackApp: App {
    @StateObject private var userManager = UserManager()
    @StateObject private var fastManager = FastManager()
    
    init() {
        // Configure Firebase
        FirebaseApp.configure()
    }
    
    var body: some Scene {
        WindowGroup {
            if userManager.isLoggedIn {
                ContentView()
                    .environmentObject(userManager)
                    .environmentObject(fastManager)
            } else {
                OnboardingView()
                    .environmentObject(userManager)
            }
        }
    }
}
