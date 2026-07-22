import { FileText, Download, Clock, Send, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportsAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 px-4 py-3 rounded-2xl flex items-center">
        <FileText className="w-5 h-5 mr-3" />
        <p className="text-sm font-medium">Export functionality and scheduled reports are currently in beta.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Manual Export */}
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
                <Download className="w-5 h-5 mr-2" />
                Manual Export
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
                Export current dashboard data to your preferred format. Respects the global date filters.
            </p>
            <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" /> Export to CSV
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                    <FileText className="w-4 h-4 mr-2" /> Export to Excel (.xlsx)
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                    <FileText className="w-4 h-4 mr-2" /> Export to PDF
                </Button>
            </div>
        </div>

        {/* Scheduled Reports */}
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
                <Clock className="w-5 h-5 mr-2" />
                Scheduled Reports
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
                Automate delivery of key metrics to your email or Slack channel.
            </p>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/20 border border-border/50">
                    <div>
                        <p className="font-medium">Daily Executive Summary</p>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Send className="w-3 h-3 mr-1" /> delivered via Email
                        </p>
                    </div>
                    <Button variant="secondary" size="sm" disabled>Configure</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/20 border border-border/50">
                    <div>
                        <p className="font-medium">Weekly Growth Metrics</p>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" /> Every Monday 9:00 AM
                        </p>
                    </div>
                    <Button variant="secondary" size="sm" disabled>Configure</Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
