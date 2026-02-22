import SwiftUI

// MARK: - ContentView (Main Dashboard)
struct ContentView: View {
    @EnvironmentObject var userManager: UserManager
    @EnvironmentObject var fastManager: FastManager
    @State private var showTimerView = false
    @State private var showWeightLog = false
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Dashboard Tab
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "square.grid.2x2")
                }
                .tag(0)
            
            // Timer Tab
            TimerView()
                .tabItem {
                    Label("Fast", systemImage: "timer")
                }
                .tag(1)
            
            // History Tab
            HistoryView()
                .tabItem {
                    Label("History", systemImage: "calendar")
                }
                .tag(2)
            
            // Settings Tab
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .tag(3)
        }
    }
}

// MARK: - DashboardView
struct DashboardView: View {
    @EnvironmentObject var fastManager: FastManager
    @EnvironmentObject var userManager: UserManager
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                // Current Streak (Big Card)
                ZStack {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(LinearGradient(
                            gradient: Gradient(colors: [Color.blue.opacity(0.8), Color.blue.opacity(0.6)]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))
                    
                    VStack(spacing: 10) {
                        Text("Current Streak")
                            .font(.headline)
                            .foregroundColor(.white.opacity(0.9))
                        
                        Text("\(fastManager.stats.current_streak)")
                            .font(.system(size: 60, weight: .bold, design: .default))
                            .foregroundColor(.white)
                        
                        Text("days")
                            .font(.body)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .frame(height: 200)
                
                // Stats Grid
                VStack(spacing: 16) {
                    HStack(spacing: 16) {
                        StatCard(
                            title: "Total Fasts",
                            value: "\(fastManager.stats.total_fasts_completed)",
                            icon: "checkmark.circle.fill",
                            color: .green
                        )
                        
                        StatCard(
                            title: "Longest Streak",
                            value: "\(fastManager.stats.longest_streak)",
                            icon: "flame.fill",
                            color: .orange
                        )
                    }
                    
                    HStack(spacing: 16) {
                        StatCard(
                            title: "Avg Duration",
                            value: String(format: "%.1f", fastManager.stats.average_fasting_duration),
                            icon: "clock.fill",
                            color: .purple,
                            unit: "hrs"
                        )
                        
                        StatCard(
                            title: "Consistency",
                            value: String(format: "%.0f", fastManager.stats.consistency_percentage),
                            icon: "percent",
                            color: .red,
                            unit: "%"
                        )
                    }
                }
                
                // Weight Change (if available)
                if let weightChange = fastManager.stats.weight_change {
                    HStack(spacing: 12) {
                        Image(systemName: weightChange > 0 ? "arrow.up" : "arrow.down")
                            .foregroundColor(weightChange > 0 ? .red : .green)
                        
                        Text("Weight Change: ")
                            .font(.body)
                        
                        Text(String(format: "%.1f", weightChange))
                            .font(.headline)
                            .foregroundColor(weightChange > 0 ? .red : .green)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("FastTrack")
        }
    }
}

// MARK: - StatCard (Helper)
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    var unit: String = ""
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.headline)
                
                Text(title)
                    .font(.caption)
                    .foregroundColor(.gray)
                
                Spacer()
            }
            
            HStack {
                Text(value)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(color)
                
                if !unit.isEmpty {
                    Text(unit)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                
                Spacer()
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(UIColor.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - TimerView
struct TimerView: View {
    @EnvironmentObject var fastManager: FastManager
    @State private var selectedProtocol: FastingProtocol = .sixteen_eight
    @State private var timeRemaining: TimeInterval = 0
    @State private var timer: Timer?
    @State private var isFasting = false
    @State private var showProtocolPicker = false
    
    var timeFormatted: String {
        let hours = Int(timeRemaining) / 3600
        let minutes = (Int(timeRemaining) % 3600) / 60
        let seconds = Int(timeRemaining) % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 30) {
                Spacer()
                
                // Protocol Selection
                VStack(spacing: 12) {
                    Text("Fasting Protocol")
                        .font(.headline)
                        .foregroundColor(.gray)
                    
                    HStack {
                        ForEach(FastingProtocol.allCases, id: \.self) { protocol in
                            Button(action: { selectedProtocol = protocol; isFasting = false; stopTimer() }) {
                                Text(protocol.displayName)
                                    .font(.caption)
                                    .padding(8)
                                    .frame(maxWidth: .infinity)
                                    .background(selectedProtocol == protocol ? Color.blue : Color.gray.opacity(0.2))
                                    .foregroundColor(selectedProtocol == protocol ? .white : .gray)
                                    .cornerRadius(8)
                            }
                            .disabled(isFasting)
                        }
                    }
                }
                
                Spacer()
                
                // Timer Display
                VStack(spacing: 20) {
                    ZStack {
                        Circle()
                            .stroke(Color.gray.opacity(0.2), lineWidth: 20)
                        
                        Circle()
                            .trim(from: 0, to: min(timeRemaining / TimeInterval(selectedProtocol.fasting_hours * 3600), 1))
                            .stroke(Color.blue, style: StrokeStyle(lineWidth: 20, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                            .animation(.linear(duration: 1), value: timeRemaining)
                        
                        VStack(spacing: 10) {
                            Text(timeFormatted)
                                .font(.system(size: 60, weight: .bold, design: .monospaced))
                            
                            Text("\(selectedProtocol.fasting_hours)h fast")
                                .font(.body)
                                .foregroundColor(.gray)
                        }
                    }
                    .frame(height: 300)
                    
                    // Start / Stop Button
                    Button(action: { isFasting ? endFast() : startFast() }) {
                        Text(isFasting ? "End Fast" : "Start Fast")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(isFasting ? Color.red : Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("Timer")
            .onDisappear {
                stopTimer()
            }
        }
    }
    
    private func startFast() {
        isFasting = true
        timeRemaining = TimeInterval(selectedProtocol.fasting_hours * 3600)
        fastManager.startFast(protocol: selectedProtocol)
        startTimer()
    }
    
    private func endFast() {
        isFasting = false
        stopTimer()
        fastManager.endCurrentFast()
    }
    
    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
            } else {
                stopTimer()
                // Optional: Trigger notification
            }
        }
    }
    
    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
}

// MARK: - HistoryView
struct HistoryView: View {
    @EnvironmentObject var fastManager: FastManager
    @State private var showWeightLog = false
    
    var body: some View {
        NavigationStack {
            VStack {
                // Quick Weight Log Button
                Button(action: { showWeightLog = true }) {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                        Text("Log Weight")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .padding()
                
                // Fast History List
                List {
                    ForEach(fastManager.fasts.sorted { $0.date > $1.date }) { fast in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("\(fast.protocol.displayName)")
                                    .font(.headline)
                                
                                Spacer()
                                
                                if fast.completed {
                                    Label("Completed", systemImage: "checkmark.circle.fill")
                                        .font(.caption)
                                        .foregroundColor(.green)
                                } else {
                                    Label("In Progress", systemImage: "clock.fill")
                                        .font(.caption)
                                        .foregroundColor(.orange)
                                }
                            }
                            
                            HStack {
                                Text(fast.date.formatted(date: .abbreviated, time: .omitted))
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                
                                Spacer()
                                
                                if let duration = fast.duration_hours {
                                    Text(String(format: "%.1f hrs", duration))
                                        .font(.caption)
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                .listStyle(.plain)
            }
            .navigationTitle("History")
            .sheet(isPresented: $showWeightLog) {
                WeightLogSheet()
                    .environmentObject(fastManager)
            }
        }
    }
}

// MARK: - WeightLogSheet
struct WeightLogSheet: View {
    @EnvironmentObject var fastManager: FastManager
    @Environment(\.dismiss) var dismiss
    @State private var weight: String = ""
    @State private var notes: String = ""
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                VStack(alignment: .leading) {
                    Text("Weight")
                        .font(.headline)
                    
                    HStack {
                        TextField("Enter weight", text: $weight)
                            .keyboardType(.decimalPad)
                        
                        Text("lbs")
                            .foregroundColor(.gray)
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                }
                
                VStack(alignment: .leading) {
                    Text("Notes (Optional)")
                        .font(.headline)
                    
                    TextEditor(text: $notes)
                        .frame(height: 100)
                        .border(Color.gray.opacity(0.3))
                }
                
                Button(action: saveWeight) {
                    Text("Save Weight")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("Log Weight")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
    
    private func saveWeight() {
        guard let weightValue = Double(weight) else { return }
        fastManager.logWeight(weightValue, notes: notes.isEmpty ? nil : notes)
        dismiss()
    }
}

// MARK: - SettingsView
struct SettingsView: View {
    @EnvironmentObject var userManager: UserManager
    @EnvironmentObject var fastManager: FastManager
    @State private var notificationsEnabled = true
    @State private var notificationTime = Date()
    @State private var showDeleteConfirmation = false
    
    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Profile")) {
                    if let profile = userManager.profile {
                        Text("Email: \(profile.email)")
                        Text("Goal: \(profile.goal)")
                        Text("Protocol: \(profile.preferred_protocol.displayName)")
                    }
                }
                
                Section(header: Text("Notifications")) {
                    Toggle("Enable Daily Reminder", isOn: $notificationsEnabled)
                    
                    if notificationsEnabled {
                        DatePicker("Reminder Time", selection: $notificationTime, displayedComponents: .hourAndMinute)
                    }
                }
                
                Section(header: Text("Account")) {
                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Text("Delete Account")
                    }
                    
                    Button(role: .destructive) {
                        try? userManager.logout()
                    } label: {
                        Text("Logout")
                    }
                }
                
                Section(header: Text("Support")) {
                    Link("Email Support", destination: URL(string: "mailto:support@fasttrack.app") ?? URL(fileURLWithPath: ""))
                }
            }
            .navigationTitle("Settings")
            .alert("Delete Account?", isPresented: $showDeleteConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    Task {
                        do {
                            try await userManager.deleteAccount()
                        } catch {
                            print("Error deleting account: \(error)")
                        }
                    }
                }
            } message: {
                Text("This cannot be undone. All your fasting data will be permanently deleted.")
            }
        }
    }
}

// MARK: - OnboardingView
struct OnboardingView: View {
    @EnvironmentObject var userManager: UserManager
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var isSignUp = true
    @State private var error: String?
    @State private var isLoading = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Spacer()
                
                Text("FastTrack")
                    .font(.system(size: 48, weight: .bold))
                    .foregroundColor(.blue)
                
                Text(isSignUp ? "Start Your Fasting Journey" : "Welcome Back")
                    .font(.title3)
                    .foregroundColor(.gray)
                
                Spacer()
                
                VStack(spacing: 16) {
                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    
                    SecureField("Password", text: $password)
                        .textFieldStyle(.roundedBorder)
                    
                    if isSignUp {
                        SecureField("Confirm Password", text: $confirmPassword)
                            .textFieldStyle(.roundedBorder)
                    }
                }
                
                if let error = error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding()
                        .background(Color.red.opacity(0.1))
                        .cornerRadius(8)
                }
                
                Button(action: authenticate) {
                    if isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text(isSignUp ? "Sign Up" : "Sign In")
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(12)
                .disabled(isLoading)
                
                Button(action: { isSignUp.toggle(); error = nil }) {
                    Text(isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
                
                Spacer()
            }
            .padding()
        }
    }
    
    private func authenticate() {
        isLoading = true
        error = nil
        
        Task {
            do {
                if isSignUp {
                    guard password == confirmPassword else {
                        error = "Passwords don't match"
                        isLoading = false
                        return
                    }
                    try await userManager.signUp(email: email, password: password)
                } else {
                    try await userManager.login(email: email, password: password)
                }
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }
}

#Preview {
    DashboardView()
        .environmentObject(UserManager())
        .environmentObject(FastManager())
}
