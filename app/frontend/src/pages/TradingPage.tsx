import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TradingPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Trading Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
          <Input placeholder="Search stocks..." className="mb-4" />
          <Button>Refresh Data</Button>
        </div>
        
        <div className="bg-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Portfolio Status</h2>
          <p>Portfolio functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
} 