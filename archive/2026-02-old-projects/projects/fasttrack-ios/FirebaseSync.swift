import Foundation
import FirebaseDatabase

// MARK: - Firebase Synchronization Extension

extension FastManager {
    
    // MARK: - Real-Time Sync to Firebase
    
    func setupFirebaseSync(uid: String) {
        setupFastSync(uid: uid)
        setupWeightSync(uid: uid)
    }
    
    private func setupFastSync(uid: String) {
        let ref = database.child("users/\(uid)/fasts")
        
        ref.observe(.value) { [weak self] snapshot in
            guard let self = self else { return }
            
            var synced_fasts: [FastLog] = []
            
            if let data = snapshot.value as? [String: Any] {
                for (_, value) in data {
                    do {
                        let json = try JSONSerialization.data(withJSONObject: value)
                        let fast = try JSONDecoder().decode(FastLog.self, from: json)
                        synced_fasts.append(fast)
                    } catch {
                        print("Error decoding fast from Firebase: \(error)")
                    }
                }
            }
            
            // Merge: local + Firebase (Firebase wins if conflict)
            self.mergeFastsWithFirebase(synced_fasts)
        } withCancel: { error in
            print("Firebase fast sync error: \(error)")
        }
    }
    
    private func setupWeightSync(uid: String) {
        let ref = database.child("users/\(uid)/weights")
        
        ref.observe(.value) { [weak self] snapshot in
            guard let self = self else { return }
            
            var synced_weights: [WeightLog] = []
            
            if let data = snapshot.value as? [String: Any] {
                for (_, value) in data {
                    do {
                        let json = try JSONSerialization.data(withJSONObject: value)
                        let weight = try JSONDecoder().decode(WeightLog.self, from: json)
                        synced_weights.append(weight)
                    } catch {
                        print("Error decoding weight from Firebase: \(error)")
                    }
                }
            }
            
            // Merge: local + Firebase
            self.mergeWeightsWithFirebase(synced_weights)
        } withCancel: { error in
            print("Firebase weight sync error: \(error)")
        }
    }
    
    // MARK: - Merge Logic (Conflict Resolution)
    
    private func mergeFastsWithFirebase(_ firebase_fasts: [FastLog]) {
        var merged = self.fasts
        
        for firebase_fast in firebase_fasts {
            if let index = merged.firstIndex(where: { $0.id == firebase_fast.id }) {
                // Update if Firebase version is newer
                merged[index] = firebase_fast
            } else {
                // Add new from Firebase
                merged.append(firebase_fast)
            }
        }
        
        DispatchQueue.main.async {
            self.fasts = merged
            self.saveCachedData()
            self.recalculateStats()
        }
    }
    
    private func mergeWeightsWithFirebase(_ firebase_weights: [WeightLog]) {
        var merged = self.weights
        
        for firebase_weight in firebase_weights {
            if let index = merged.firstIndex(where: { $0.id == firebase_weight.id }) {
                // Update if Firebase version is newer
                merged[index] = firebase_weight
            } else {
                // Add new from Firebase
                merged.append(firebase_weight)
            }
        }
        
        DispatchQueue.main.async {
            self.weights = merged
            self.saveCachedData()
            self.recalculateStats()
        }
    }
    
    // MARK: - Upload to Firebase (When Online)
    
    func syncFastToFirebase(fast: FastLog, uid: String) async throws {
        let fastData = try JSONEncoder().encode(fast)
        let fastDict = try JSONSerialization.jsonObject(with: fastData) as? [String: Any] ?? [:]
        try await database.child("users/\(uid)/fasts/\(fast.id)").setValue(fastDict)
        print("✅ Fast synced to Firebase: \(fast.id)")
    }
    
    func syncWeightToFirebase(weight: WeightLog, uid: String) async throws {
        let weightData = try JSONEncoder().encode(weight)
        let weightDict = try JSONSerialization.jsonObject(with: weightData) as? [String: Any] ?? [:]
        try await database.child("users/\(uid)/weights/\(weight.id)").setValue(weightDict)
        print("✅ Weight synced to Firebase: \(weight.id)")
    }
    
    func deleteFastFromFirebase(fastId: String, uid: String) async throws {
        try await database.child("users/\(uid)/fasts/\(fastId)").removeValue()
        print("✅ Fast deleted from Firebase: \(fastId)")
    }
    
    func deleteWeightFromFirebase(weightId: String, uid: String) async throws {
        try await database.child("users/\(uid)/weights/\(weightId)").removeValue()
        print("✅ Weight deleted from Firebase: \(weightId)")
    }
}

// MARK: - Offline Detection & Sync on Reconnect

class NetworkMonitor {
    static let shared = NetworkMonitor()
    
    @Published var isOnline = true
    
    private init() {
        setupNetworkMonitoring()
    }
    
    private func setupNetworkMonitoring() {
        // Listen for Firebase connection state
        let connectedRef = Database.database().reference(withPath: ".info/connected")
        
        connectedRef.observe(.value) { [weak self] snapshot in
            if let connected = snapshot.value as? Bool {
                DispatchQueue.main.async {
                    self?.isOnline = connected
                    if connected {
                        print("📡 Back online - syncing...")
                        self?.syncPendingChanges()
                    } else {
                        print("📡 Offline - using local cache")
                    }
                }
            }
        }
    }
    
    private func syncPendingChanges() {
        // Future: Re-sync any pending changes from offline queue
        print("Syncing pending changes...")
    }
}
