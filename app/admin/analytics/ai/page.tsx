import { MetricCard } from "@/components/admin/MetricCard";
import { LineChartCard } from "@/components/admin/LineChartCard";
import { Bot, Zap, Clock, Coins, FileAudio, FileText, MessageSquare } from "lucide-react";

export default async function AIAnalyticsPage() {
  // Mock Data since AILog schema doesn't exist yet
  const totalRequests = 125430;
  const tokensUsed = 4500000;
  const avgResponseTime = 1240;
  const estimatedCost = (tokensUsed / 1000) * 0.02; // Roughly $0.02 per 1k tokens

  // Mock Time Series
  const chartData = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Tokens: Math.floor(Math.random() * 50000) + 100000
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-lg flex items-center">
        <Zap className="w-5 h-5 mr-3" />
        <p className="text-sm font-medium">Schema Update Required: AI analytics are currently displaying estimated placeholder data until the AILog model is added to Prisma.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="AI Requests"
          value={totalRequests.toLocaleString()}
          icon={<Bot className="text-blue-500" />}
          description="Total invocations"
        />
        <MetricCard
          title="Tokens Used"
          value={tokensUsed.toLocaleString()}
          icon={<Zap className="text-emerald-500" />}
          description="Input + Output tokens"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${avgResponseTime}ms`}
          icon={<Clock className="text-amber-500" />}
          description="Model latency"
        />
        <MetricCard
          title="Estimated Cost"
          value={`$${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<Coins className="text-red-500" />}
          description="API usage spend"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChartCard 
          title="Daily Token Usage" 
          description="Tokens consumed per day"
          data={chartData}
          xDataKey="date"
          yDataKey="Tokens"
        />
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6">
            <h3 className="text-lg font-semibold flex items-center mb-4">
                <Bot className="w-5 h-5 mr-2" />
                Requests by Feature
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/50">
                    <div className="flex items-center">
                        <FileAudio className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Audio Transcriptions</span>
                    </div>
                    <span className="text-muted-foreground">45%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/50">
                    <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Summarizations</span>
                    </div>
                    <span className="text-muted-foreground">35%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/50">
                    <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Chat Assistant</span>
                    </div>
                    <span className="text-muted-foreground">20%</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
