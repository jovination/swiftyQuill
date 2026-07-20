import { Bot } from "lucide-react";

export default async function AIAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-lg flex items-center">
        <Bot className="w-5 h-5 mr-3" />
        <p className="text-sm font-medium">AI analytics will appear here once the AILog model is added to the database schema.</p>
      </div>

      <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
        <Bot className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
        <h3 className="text-lg font-semibold">No AI Data</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">Request counts, token usage, and cost tracking will be available once AI logging is implemented.</p>
      </div>
    </div>
  );
}
