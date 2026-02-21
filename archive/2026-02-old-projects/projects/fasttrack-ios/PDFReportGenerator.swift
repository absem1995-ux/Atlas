import Foundation
import PDFKit

// MARK: - Weekly PDF Report Generator

struct PDFReport {
    let filename: String
    let data: Data
    let generatedDate: Date
}

class PDFReportGenerator {
    
    static func generateWeeklyReport(
        fasts: [FastLog],
        weights: [WeightLog],
        stats: FastingStats,
        userName: String
    ) -> PDFReport? {
        let pdfMetaData = [
            kCGPDFContextCreator: "FastTrack",
            kCGPDFContextAuthor: "FastTrack Fasting Tracker",
            kCGPDFContextTitle: "Weekly Fasting Report"
        ]
        
        let pdfPageBounds = CGRect(x: 0, y: 0, width: 612, height: 792) // Letter size
        
        var pdfPages: [UIImage] = []
        
        // Page 1: Summary
        if let summaryPage = generateSummaryPage(
            stats: stats,
            userName: userName,
            pageSize: pdfPageBounds.size
        ) {
            pdfPages.append(summaryPage)
        }
        
        // Page 2: Weekly Chart
        if let chartPage = generateChartPage(
            fasts: Array(fasts.suffix(7)), // Last 7 days
            weights: Array(weights.suffix(7)),
            pageSize: pdfPageBounds.size
        ) {
            pdfPages.append(chartPage)
        }
        
        // Page 3: Detailed Logs
        if let logsPage = generateLogsPage(
            fasts: Array(fasts.suffix(7)),
            pageSize: pdfPageBounds.size
        ) {
            pdfPages.append(logsPage)
        }
        
        // Combine pages into PDF
        guard let pdfData = createPDFFromPages(pdfPages, metaData: pdfMetaData) else {
            return nil
        }
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let filename = "FastTrack_Report_\(dateFormatter.string(from: Date())).pdf"
        
        return PDFReport(
            filename: filename,
            data: pdfData,
            generatedDate: Date()
        )
    }
    
    // MARK: - Page Generation
    
    private static func generateSummaryPage(
        stats: FastingStats,
        userName: String,
        pageSize: CGSize
    ) -> UIImage? {
        let renderer = UIGraphicsPDFRenderer(bounds: CGRect(origin: .zero, size: pageSize))
        
        let image = renderer.pdfData { context in
            context.beginPage()
            
            let rect = context.format.bounds
            let margin: CGFloat = 40
            var currentY: CGFloat = margin
            
            // Title
            let titleFont = UIFont.systemFont(ofSize: 28, weight: .bold)
            let title = "FastTrack Weekly Report"
            title.draw(
                at: CGPoint(x: margin, y: currentY),
                withAttributes: [.font: titleFont, .foregroundColor: UIColor.black]
            )
            currentY += 50
            
            // Date Range
            let dateFont = UIFont.systemFont(ofSize: 14, weight: .regular)
            let dateRange = "Week of \(formatDate(Date(timeIntervalSinceNow: -7*86400))) - \(formatDate(Date()))"
            dateRange.draw(
                at: CGPoint(x: margin, y: currentY),
                withAttributes: [.font: dateFont, .foregroundColor: UIColor.gray]
            )
            currentY += 40
            
            // Stats Section
            let headingFont = UIFont.systemFont(ofSize: 18, weight: .semibold)
            "Your Stats This Week".draw(
                at: CGPoint(x: margin, y: currentY),
                withAttributes: [.font: headingFont, .foregroundColor: UIColor.black]
            )
            currentY += 40
            
            // Stats Grid
            let statFont = UIFont.systemFont(ofSize: 12, weight: .regular)
            let stats_list = [
                ("Current Streak", "\(stats.current_streak) days"),
                ("Total Fasts", "\(stats.total_fasts_completed)"),
                ("Longest Streak", "\(stats.longest_streak) days"),
                ("Avg Duration", String(format: "%.1f hours", stats.average_fasting_duration)),
                ("Consistency", String(format: "%.0f%%", stats.consistency_percentage)),
                ("Weight Change", stats.weight_change.map { String(format: "%.1f lbs", $0) } ?? "N/A")
            ]
            
            for (label, value) in stats_list {
                let text = "\(label): \(value)"
                text.draw(
                    at: CGPoint(x: margin, y: currentY),
                    withAttributes: [.font: statFont, .foregroundColor: UIColor.black]
                )
                currentY += 25
            }
            
            // Insights
            currentY += 30
            "Insights".draw(
                at: CGPoint(x: margin, y: currentY),
                withAttributes: [.font: headingFont, .foregroundColor: UIColor.black]
            )
            currentY += 40
            
            let insight = generateInsight(stats: stats)
            let insightFont = UIFont.systemFont(ofSize: 12, weight: .regular)
            let insightRect = CGRect(
                x: margin,
                y: currentY,
                width: rect.width - (2 * margin),
                height: 100
            )
            insight.draw(in: insightRect, withFont: insightFont, lineBreakMode: .byWordWrapping)
        }
        
        return image.cgPDFPage?.getDrawingPage()?.image
    }
    
    private static func generateChartPage(
        fasts: [FastLog],
        weights: [WeightLog],
        pageSize: CGSize
    ) -> UIImage? {
        let renderer = UIGraphicsPDFRenderer(bounds: CGRect(origin: .zero, size: pageSize))
        
        let image = renderer.pdfData { context in
            context.beginPage()
            
            let rect = context.format.bounds
            let margin: CGFloat = 40
            var currentY: CGFloat = margin
            
            // Title
            let titleFont = UIFont.systemFont(ofSize: 20, weight: .semibold)
            "Weekly Trend".draw(
                at: CGPoint(x: margin, y: currentY),
                withAttributes: [.font: titleFont, .foregroundColor: UIColor.black]
            )
            currentY += 40
            
            // Fasting Duration Chart (text-based for now)
            "Fasting Duration by Day".draw(
                at: CGPoint(x: margin, y: currentY),
                withAttributes: [.font: UIFont.systemFont(ofSize: 14, weight: .regular)]
            )
            currentY += 30
            
            let textFont = UIFont.systemFont(ofSize: 11, weight: .regular)
            for (index, fast) in fasts.enumerated() {
                if fast.completed {
                    let dayName = getDayName(fast.date)
                    let duration = fast.duration_hours.map { String(format: "%.1f hrs", $0) } ?? "N/A"
                    let text = "\(dayName): \(duration)"
                    text.draw(
                        at: CGPoint(x: margin + 20, y: currentY),
                        withAttributes: [.font: textFont, .foregroundColor: UIColor.black]
                    )
                    currentY += 20
                }
            }
            
            currentY += 30
            
            // Weight Trend
            "Weight Trend".draw(
                at: CGPoint(x: margin, y: currentY),
                withAttributes: [.font: UIFont.systemFont(ofSize: 14, weight: .regular)]
            )
            currentY += 30
            
            for weight in weights.suffix(7) {
                let dayName = getDayName(weight.date)
                let text = "\(dayName): \(String(format: "%.1f", weight.weight)) lbs"
                text.draw(
                    at: CGPoint(x: margin + 20, y: currentY),
                    withAttributes: [.font: textFont, .foregroundColor: UIColor.black]
                )
                currentY += 20
            }
        }
        
        return image.cgPDFPage?.getDrawingPage()?.image
    }
    
    private static func generateLogsPage(
        fasts: [FastLog],
        pageSize: CGSize
    ) -> UIImage? {
        let renderer = UIGraphicsPDFRenderer(bounds: CGRect(origin: .zero, size: pageSize))
        
        let image = renderer.pdfData { context in
            context.beginPage()
            
            let rect = context.format.bounds
            let margin: CGFloat = 40
            var currentY: CGFloat = margin
            
            // Title
            let titleFont = UIFont.systemFont(ofSize: 20, weight: .semibold)
            "Detailed Logs".draw(
                at: CGPoint(x: margin, y: currentY),
                withAttributes: [.font: titleFont, .foregroundColor: UIColor.black]
            )
            currentY += 40
            
            let textFont = UIFont.systemFont(ofSize: 10, weight: .regular)
            
            for fast in fasts.sorted(by: { $0.date > $1.date }) {
                let dateStr = formatDate(fast.date)
                let protocol = fast.protocol.rawValue
                let status = fast.completed ? "✓ Completed" : "○ In Progress"
                let duration = fast.duration_hours.map { String(format: "%.1f hrs", $0) } ?? "—"
                
                let text = "\(dateStr) | \(protocol) | \(duration) | \(status)"
                text.draw(
                    at: CGPoint(x: margin, y: currentY),
                    withAttributes: [.font: textFont, .foregroundColor: UIColor.black]
                )
                currentY += 20
            }
        }
        
        return image.cgPDFPage?.getDrawingPage()?.image
    }
    
    // MARK: - Helper Functions
    
    private static func createPDFFromPages(_ pages: [UIImage], metaData: [String: Any]) -> Data? {
        let pdfData = NSMutableData()
        UIGraphicsBeginPDFContextToData(pdfData, CGRect.zero, metaData)
        
        for page in pages {
            UIGraphicsBeginPDFPage()
            page.draw(in: UIGraphicsGetPDFContextBounds())
        }
        
        UIGraphicsEndPDFContext()
        
        return pdfData as Data
    }
    
    private static func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d, yyyy"
        return formatter.string(from: date)
    }
    
    private static func getDayName(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return formatter.string(from: date)
    }
    
    private static func generateInsight(stats: FastingStats) -> String {
        if stats.current_streak >= 7 {
            return "🔥 Great job! You've maintained a \(stats.current_streak)-day streak. Your consistency is \(String(format: "%.0f%%", stats.consistency_percentage))%. Keep it up!"
        } else if stats.consistency_percentage >= 80 {
            return "📈 Your consistency is excellent at \(String(format: "%.0f%%", stats.consistency_percentage))%. You're averaging \(String(format: "%.1f", stats.average_fasting_duration)) hours of fasting per session."
        } else if let weightChange = stats.weight_change, weightChange < 0 {
            return "🎯 You're making progress! Your weight has changed by \(String(format: "%.1f", weightChange)) lbs. Keep fasting consistently."
        } else {
            return "💪 You've completed \(stats.total_fasts_completed) fasts this week. Your longest streak is \(stats.longest_streak) days. Focus on consistency!"
        }
    }
}

extension UIGraphicsPDFPage {
    var image: UIImage? {
        guard let cgPDFPage = self.pageRef else { return nil }
        let mediaBoxRect = cgPDFPage.getBoxRect(.mediaBox)
        let renderer = UIGraphicsImageRenderer(size: mediaBoxRect.size)
        return renderer.image { context in
            UIColor.white.setFill()
            context.fill(CGRect(origin: .zero, size: mediaBoxRect.size))
            context.cgContext.drawPDFPage(cgPDFPage)
        }
    }
}
