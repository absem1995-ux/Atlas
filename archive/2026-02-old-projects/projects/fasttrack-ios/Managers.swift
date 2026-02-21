import Foundation
import FirebaseAuth
import FirebaseDatabase

// MARK: - UserManager (Authentication & Profile)
class UserManager: NSObject, ObservableObject {
    @Published var user: FirebaseAuth.User?
    @Published var profile: UserProfile?
    @Published var subscription: Subscription?
    @Published var isLoggedIn = false
    @Published var error: String?
    
    private let auth = Auth.auth()
    private let database = Database.database().reference()
    
    override init() {
        super.init()
        setupAuthListener()
    }
    
    private func setupAuthListener() {
        auth.addStateDidChangeListener { [weak self] _, user in
            self?.user = user
            self?.isLoggedIn = user != nil
            if let user = user {
                self?.loadProfile(uid: user.uid)
                self?.loadSubscription(uid: user.uid)
            }
        }
    }
    
    // MARK: - Authentication
    func signUp(email: String, password: String) async throws {
        let result = try await auth.createUser(withEmail: email, password: password)
        let newProfile = UserProfile(uid: result.user.uid, email: email)
        try await saveProfile(newProfile)
        let newSubscription = Subscription(user_id: result.user.uid, plan: "free")
        try await saveSubscription(newSubscription)
    }
    
    func login(email: String, password: String) async throws {
        try await auth.signIn(withEmail: email, password: password)
    }
    
    func logout() throws {
        try auth.signOut()
        self.profile = nil
        self.subscription = nil
    }
    
    func deleteAccount() async throws {
        guard let uid = user?.uid else { 
            throw NSError(domain: "UserManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "No user logged in"]) 
        }
        
        // Delete user profile data from Firebase
        try await database.child("users/\(uid)").removeValue()
        
        // Delete authentication user
        try await user?.delete()
        
        // Clear local state
        self.user = nil
        self.profile = nil
        self.subscription = nil
        self.isLoggedIn = false
    }
    
    // MARK: - Profile Management
    func saveProfile(_ profile: UserProfile) async throws {
        guard let uid = user?.uid else { throw NSError(domain: "UserManager", code: -1, userInfo: [NSLocalizedDescriptionKey: "No user logged in"]) }
        let profileData = try JSONEncoder().encode(profile)
        let profileDict = try JSONSerialization.jsonObject(with: profileData) as? [String: Any] ?? [:]
        try await database.child("users/\(uid)/profile").setValue(profileDict)
        DispatchQueue.main.async {
            self.profile = profile
        }
    }
    
    private func loadProfile(uid: String) {
        database.child("users/\(uid)/profile").getData { [weak self] error, snapshot in
            if let error = error {
                print("Error loading profile: \(error)")
                self?.error = error.localizedDescription
                return
            }
            
            guard let data = snapshot?.value as? [String: Any] else {
                print("No profile found, creating new")
                return
            }
            
            do {
                let json = try JSONSerialization.data(withJSONObject: data)
                let profile = try JSONDecoder().decode(UserProfile.self, from: json)
                DispatchQueue.main.async {
                    self?.profile = profile
                }
            } catch {
                print("Error decoding profile: \(error)")
                self?.error = error.localizedDescription
            }
        }
    }
    
    // MARK: - Subscription Management
    func saveSubscription(_ subscription: Subscription) async throws {
        let subscriptionData = try JSONEncoder().encode(subscription)
        let subscriptionDict = try JSONSerialization.jsonObject(with: subscriptionData) as? [String: Any] ?? [:]
        try await database.child("users/\(subscription.user_id)/subscription").setValue(subscriptionDict)
        DispatchQueue.main.async {
            self.subscription = subscription
        }
    }
    
    private func loadSubscription(uid: String) {
        database.child("users/\(uid)/subscription").getData { [weak self] error, snapshot in
            if let error = error {
                print("Error loading subscription: \(error)")
                return
            }
            
            guard let data = snapshot?.value as? [String: Any] else {
                print("No subscription found")
                return
            }
            
            do {
                let json = try JSONSerialization.data(withJSONObject: data)
                let subscription = try JSONDecoder().decode(Subscription.self, from: json)
                DispatchQueue.main.async {
                    self?.subscription = subscription
                }
            } catch {
                print("Error decoding subscription: \(error)")
            }
        }
    }
    
    func isPremium() -> Bool {
        return subscription?.plan == "premium" && subscription?.is_active == true
    }
}

// MARK: - FastManager (Fasting Log & Persistence)
class FastManager: NSObject, ObservableObject {
    @Published var fasts: [FastLog] = []
    @Published var weights: [WeightLog] = []
    @Published var stats: FastingStats = FastingStats(current_streak: 0, longest_streak: 0, total_fasts_completed: 0, average_fasting_duration: 0, weight_change: nil, consistency_percentage: 0)
    @Published var currentFast: FastLog?
    @Published var error: String?
    
    private let database = Database.database().reference()
    private let userDefaults = UserDefaults.standard
    private let FASTS_KEY = "cached_fasts"
    private let WEIGHTS_KEY = "cached_weights"
    
    override init() {
        super.init()
        loadCachedData()
    }
    
    // MARK: - Cache Management
    private func loadCachedData() {
        // Load from UserDefaults
        if let data = userDefaults.data(forKey: FASTS_KEY) {
            do {
                fasts = try JSONDecoder().decode([FastLog].self, from: data)
                print("Loaded \(fasts.count) cached fasts")
            } catch {
                print("Error decoding cached fasts: \(error)")
            }
        }
        
        if let data = userDefaults.data(forKey: WEIGHTS_KEY) {
            do {
                weights = try JSONDecoder().decode([WeightLog].self, from: data)
                print("Loaded \(weights.count) cached weights")
            } catch {
                print("Error decoding cached weights: \(error)")
            }
        }
        
        recalculateStats()
    }
    
    private func saveCachedData() {
        do {
            let fastsData = try JSONEncoder().encode(fasts)
            userDefaults.set(fastsData, forKey: FASTS_KEY)
            
            let weightsData = try JSONEncoder().encode(weights)
            userDefaults.set(weightsData, forKey: WEIGHTS_KEY)
            print("Data cached successfully")
        } catch {
            print("Error caching data: \(error)")
            self.error = error.localizedDescription
        }
    }
    
    // MARK: - Fast Management
    func startFast(protocol: FastingProtocol) {
        let newFast = FastLog(date: Date(), protocol: `protocol`)
        currentFast = newFast
        print("Fast started: \(protocol.rawValue)")
    }
    
    func endCurrentFast() {
        guard var fast = currentFast else {
            self.error = "No active fast"
            return
        }
        
        fast = FastLog(
            id: fast.id,
            date: fast.date,
            protocol: fast.protocol,
            start_time: fast.start_time,
            end_time: Date(),
            completed: true
        )
        
        fasts.append(fast)
        saveCachedData()
        recalculateStats()
        currentFast = nil
        print("Fast completed: \(Int(fast.duration_hours ?? 0)) hours")
    }
    
    func cancelCurrentFast() {
        currentFast = nil
        print("Fast cancelled")
    }
    
    func logFast(_ fast: FastLog) {
        fasts.append(fast)
        saveCachedData()
        recalculateStats()
    }
    
    // MARK: - Weight Management
    func logWeight(_ weight: Double, notes: String? = nil) {
        let log = WeightLog(weight: weight, notes: notes)
        weights.append(log)
        saveCachedData()
        recalculateStats()
        print("Weight logged: \(weight) \(UserDefaults.standard.string(forKey: "weight_unit") ?? "lbs")")
    }
    
    // MARK: - Statistics
    private func recalculateStats() {
        DispatchQueue.main.async {
            self.stats = FastingStats.calculate(fasts: self.fasts, weights: self.weights)
        }
    }
    
    // MARK: - Firebase Sync (Future)
    func syncToFirebase(uid: String) async throws {
        let fastsData = try JSONEncoder().encode(fasts)
        let fastsDict = try JSONSerialization.jsonObject(with: fastsData) as? [String: Any] ?? [:]
        try await database.child("users/\(uid)/fasts").setValue(fastsDict)
        print("Fasts synced to Firebase")
    }
}
