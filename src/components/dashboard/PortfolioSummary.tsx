import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  CoinsIcon,
  DollarSignIcon,
  PercentIcon,
  EditIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { subscribeToCoinsUpdates, unsubscribeFromCoinsUpdates } from "@/lib/coinService";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  sparklineData?: number[];
}

const MetricCard = ({
  title,
  value,
  change,
  icon,
  sparklineData = [40, 60, 45, 70, 65, 75, 80],
}: MetricCardProps) => {
  const isPositive = change >= 0;

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            <div className="flex items-center mt-1">
              <span
                className={`flex items-center text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {isPositive ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                )}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                vs last month
              </span>
            </div>
          </div>
          <div className="p-2 rounded-full bg-primary/10">{icon}</div>
        </div>
        <div className="mt-4 h-10">
          <div className="flex justify-between items-end h-8">
            {sparklineData.map((value, index) => (
              <div
                key={index}
                className={`w-1 rounded-t-sm ${isPositive ? "bg-green-500" : "bg-red-500"}`}
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PortfolioSummaryProps {
  coins: {
    id: string;
    name: string;
    purchasePrice: number;
    currentValue: number;
    roi: number;
    isSold: boolean;
    soldPrice?: number;
    soldDate?: Date;
  }[];
  cashReserves?: number;
  onUpdateCashReserves?: (newAmount: number) => void;
  onRefreshData?: () => Promise<void>;
}

const PortfolioSummary = ({
  coins = [],
  cashReserves = 50000,
  onUpdateCashReserves,
  onRefreshData,
}: PortfolioSummaryProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newCashReserves, setNewCashReserves] = useState(cashReserves.toString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Real-time updates subscription
  useEffect(() => {
    // Subscribe to real-time coin updates
    const subscription = subscribeToCoinsUpdates(() => {
      // The actual update of the coins array is handled in the parent component
      // This subscription is just to be aware of updates for UI purposes
      console.log("Coins updated in real-time");
    });
    
    // Clean up subscription when component unmounts
    return () => {
      unsubscribeFromCoinsUpdates(subscription);
    };
  }, []);
  
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Calculate total portfolio value (cash reserves + current value of active coins + profit from sold coins)
  const activeCoinsValue = coins
    .filter(coin => !coin.isSold)
    .reduce((sum, coin) => sum + coin.currentValue, 0);
  
  const soldCoinsProfit = coins
    .filter(coin => coin.isSold && coin.soldPrice)
    .reduce((sum, coin) => sum + (coin.soldPrice! - coin.purchasePrice), 0);
  
  const totalValue = cashReserves + activeCoinsValue + soldCoinsProfit;
  
  // Calculate total ROI (weighted average of active coins and sold coins)
  const activeCoins = coins.filter(coin => !coin.isSold);
  const soldCoins = coins.filter(coin => coin.isSold && coin.soldPrice);
  
  // Calculate active coins ROI (weighted by current value)
  const activeCoinsROI = activeCoins.length > 0
    ? activeCoins.reduce((sum, coin) => sum + (coin.roi * coin.currentValue), 0) / 
      activeCoins.reduce((sum, coin) => sum + coin.currentValue, 0)
    : 0;
  
  // Calculate sold coins ROI (weighted by purchase price)
  const soldCoinsROI = soldCoins.length > 0
    ? soldCoins.reduce((sum, coin) => {
        const coinROI = ((coin.soldPrice! - coin.purchasePrice) / coin.purchasePrice) * 100;
        return sum + (coinROI * coin.purchasePrice);
      }, 0) / soldCoins.reduce((sum, coin) => sum + coin.purchasePrice, 0)
    : 0;
  
  // Calculate total ROI as weighted average
  const totalActiveValue = activeCoins.reduce((sum, coin) => sum + coin.currentValue, 0);
  const totalSoldValue = soldCoins.reduce((sum, coin) => sum + coin.purchasePrice, 0);
  const totalInvestmentValue = totalActiveValue + totalSoldValue;
  
  const totalROI = totalInvestmentValue > 0
    ? ((activeCoinsROI * totalActiveValue) + (soldCoinsROI * totalSoldValue)) / totalInvestmentValue
    : 0;
  
  // Calculate monthly performance (placeholder for now)
  const monthlyPerformance = 3.2;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const handleUpdateCashReserves = () => {
    const newAmount = parseFloat(newCashReserves);
    if (!isNaN(newAmount) && newAmount >= 0) {
      if (onUpdateCashReserves) {
        onUpdateCashReserves(newAmount);
      }
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="w-full bg-background px-4 md:px-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Portfolio Summary</h2>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Overview of your rare coin investments
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData} 
            disabled={isRefreshing}
            className="ml-auto"
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Portfolio Value"
          value={formatCurrency(totalValue)}
          change={monthlyPerformance}
          icon={<DollarSignIcon className="h-5 w-5 text-primary" />}
          sparklineData={[40, 42, 50, 65, 63, 68, 70]}
        />

        <MetricCard
          title="Total ROI"
          value={`${totalROI.toFixed(1)}%`}
          change={2.3}
          icon={<PercentIcon className="h-5 w-5 text-primary" />}
          sparklineData={[30, 40, 45, 50, 55, 60, 65]}
        />

        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <p className="text-sm text-muted-foreground mb-1">Cash Reserves</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-1" 
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <EditIcon className="h-3 w-3" />
                  </Button>
                </div>
                <h3 className="text-2xl font-bold">{formatCurrency(cashReserves)}</h3>
                <div className="flex items-center mt-1">
                  <span className="flex items-center text-sm text-green-600">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    0%
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-full bg-primary/10">
                <CoinsIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 h-10">
              <div className="flex justify-between items-end h-8">
                {[60, 60, 60, 70, 70, 70, 70].map((value, index) => (
                  <div
                    key={index}
                    className="w-1 rounded-t-sm bg-green-500"
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <MetricCard
          title="Monthly Performance"
          value={`${monthlyPerformance.toFixed(1)}%`}
          change={monthlyPerformance}
          icon={<TrendingUpIcon className="h-5 w-5 text-primary" />}
          sparklineData={[35, 40, 30, 45, 55, 60, 70]}
        />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Cash Reserves</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cashReserves">Cash Reserves Amount ($)</Label>
              <Input
                id="cashReserves"
                type="number"
                value={newCashReserves}
                onChange={(e) => setNewCashReserves(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCashReserves}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioSummary;
