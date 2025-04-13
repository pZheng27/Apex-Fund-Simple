import React, { useState } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Coin {
  id: string;
  name: string;
  image: string;
  acquisitionDate: string;
  purchasePrice: number;
  currentValue: number;
  roi: number;
  description?: string;
  additionalImages?: string[];
  grade?: string;
  mint?: string;
  year?: number;
  isSold?: boolean;
  soldPrice?: number;
  soldDate?: Date;
}

interface CoinsListProps {
  coins: Coin[];
  onDeleteCoin?: (coinId: string) => void;
  onMarkAsSold?: (coinId: string, soldPrice: number) => void;
}

const CoinsList = ({ coins, onDeleteCoin, onMarkAsSold }: CoinsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Coin>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [markAsSold, setMarkAsSold] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");

  // Filter coins based on search query
  const filteredCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort coins based on sort field and direction
  const sortedCoins = [...filteredCoins].sort((a, b) => {
    if (sortDirection === "asc") {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  // Handle sort click
  const handleSort = (field: keyof Coin) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle coin selection for detailed view
  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsDialogOpen(true);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format ROI with color
  const formatROI = (roi: number) => {
    const isPositive = roi >= 0;
    return (
      <Badge
        variant={isPositive ? "default" : "destructive"}
        className={isPositive ? "bg-green-600" : ""}
      >
        {isPositive ? "+" : ""}
        {roi.toFixed(2)}%
      </Badge>
    );
  };

  const handleDeleteCoin = (coinId: string) => {
    if (onDeleteCoin) {
      onDeleteCoin(coinId);
      setIsDialogOpen(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-none border-none">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Current Holdings</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              className="rounded-md border px-2 py-1 text-sm"
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as keyof Coin);
              }}
            >
              <option value="name">Name</option>
              <option value="acquisitionDate">Acquisition Date</option>
              <option value="purchasePrice">Purchase Price</option>
              <option value="currentValue">Current Value</option>
              <option value="roi">ROI</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sortedCoins.length > 0 ? (
            sortedCoins.map((coin) => (
              <Card
                key={coin.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <div className="h-40 w-full overflow-hidden bg-muted">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="h-full w-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://api.dicebear.com/7.x/shapes/svg?seed=${coin.id}`;
                      }}
                    />
                  </div>
                  <div className="absolute top-1 right-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-white/80 backdrop-blur-sm"
                            onClick={() => handleCoinSelect(coin)}
                          >
                            <Info className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View coin details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold truncate mb-1 text-sm">{coin.name}</h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
                    {coin.isSold ? (
                      <>
                        <div className="text-muted-foreground">Acquired:</div>
                        <div className="text-right">
                          {formatDate(coin.acquisitionDate)}
                        </div>
                        <div className="text-muted-foreground">Sold Date:</div>
                        <div className="text-right">
                          {coin.soldDate ? formatDate(coin.soldDate.toISOString()) : 'N/A'}
                        </div>
                        <div className="text-muted-foreground">Purchase:</div>
                        <div className="text-right">
                          {formatCurrency(coin.purchasePrice)}
                        </div>
                        <div className="text-muted-foreground">Sold Price:</div>
                        <div className="text-right">
                          {coin.soldPrice ? formatCurrency(coin.soldPrice) : 'N/A'}
                        </div>
                        <div className="text-muted-foreground">Profit:</div>
                        <div className="text-right">
                          {coin.soldPrice ? (
                            <span className={coin.soldPrice - coin.purchasePrice >= 0 ? "text-green-600" : "text-red-600"}>
                              {formatCurrency(coin.soldPrice - coin.purchasePrice)}
                            </span>
                          ) : 'N/A'}
                        </div>
                        <div className="text-muted-foreground">ROI:</div>
                        <div className="text-right">
                          {coin.soldPrice ? (
                            <Badge
                              variant={(coin.soldPrice - coin.purchasePrice) >= 0 ? "default" : "destructive"}
                              className={(coin.soldPrice - coin.purchasePrice) >= 0 ? "bg-green-600" : ""}
                            >
                              {((coin.soldPrice - coin.purchasePrice) / coin.purchasePrice * 100).toFixed(2)}%
                            </Badge>
                          ) : 'N/A'}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-muted-foreground">Acquired:</div>
                        <div className="text-right">
                          {formatDate(coin.acquisitionDate)}
                        </div>
                        <div className="text-muted-foreground">Purchase:</div>
                        <div className="text-right">
                          {formatCurrency(coin.purchasePrice)}
                        </div>
                        <div className="text-muted-foreground">Market Value:</div>
                        <div className="text-right">
                          {formatCurrency(coin.currentValue)}
                        </div>
                        <div className="text-muted-foreground">Status:</div>
                        <div className="text-right">
                          <Badge variant="default">Active</Badge>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full h-24 flex items-center justify-center text-muted-foreground">
              No coins found.
            </div>
          )}
        </div>
      </CardContent>

      {/* Coin Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedCoin && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={selectedCoin.image}
                        alt={selectedCoin.name}
                      />
                      <AvatarFallback>
                        {selectedCoin.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedCoin.name}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    {!selectedCoin.isSold && (
                      <div className="flex items-center gap-2 mr-2">
                        <Checkbox
                          id="markAsSold"
                          checked={markAsSold}
                          onCheckedChange={(checked) => {
                            setMarkAsSold(checked as boolean);
                            if (!checked) {
                              setSoldPrice("");
                            }
                          }}
                        />
                        <Label htmlFor="markAsSold">Mark as Sold</Label>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCoin(selectedCoin.id)}
                      className="h-8"
                    >
                      Delete Coin
                    </Button>
                  </div>
                </div>
                <DialogDescription>
                  {selectedCoin.year && (
                    <span className="mr-2">Year: {selectedCoin.year}</span>
                  )}
                  {selectedCoin.mint && (
                    <span className="mr-2">Mint: {selectedCoin.mint}</span>
                  )}
                  {selectedCoin.grade && (
                    <span>Grade: {selectedCoin.grade}</span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Acquisition Details</h3>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Acquisition Date
                        </h4>
                        <p>{formatDate(selectedCoin.acquisitionDate)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Purchase Price
                        </h4>
                        <p>{formatCurrency(selectedCoin.purchasePrice)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Current Value
                        </h4>
                        <p>{formatCurrency(selectedCoin.currentValue)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          ROI
                        </h4>
                        <p>{formatROI(selectedCoin.roi)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Status
                        </h4>
                        <p>
                          {selectedCoin.isSold ? (
                            <Badge variant="destructive">Sold</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                        </p>
                      </div>
                      {selectedCoin.isSold && selectedCoin.soldPrice && (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Sold Price
                            </h4>
                            <p>{formatCurrency(selectedCoin.soldPrice)}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Sold Date
                            </h4>
                            <p>
                              {selectedCoin.soldDate
                                ? formatDate(selectedCoin.soldDate.toISOString())
                                : "N/A"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm">
                      {selectedCoin.description || "No description available."}
                    </p>
                  </div>
                </div>

                {selectedCoin.additionalImages &&
                  selectedCoin.additionalImages.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Additional Images</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedCoin.additionalImages.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`${selectedCoin.name} view ${index + 1}`}
                            className="rounded-md object-cover h-24 w-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {markAsSold && (
                  <div className="border-t pt-4 mt-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="soldPrice">Sold Price ($)</Label>
                        <Input
                          id="soldPrice"
                          type="number"
                          value={soldPrice}
                          onChange={(e) => setSoldPrice(e.target.value)}
                          placeholder="Enter sold price"
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (selectedCoin && soldPrice) {
                            onMarkAsSold && onMarkAsSold(selectedCoin.id, parseFloat(soldPrice));
                            setIsDialogOpen(false);
                            setMarkAsSold(false);
                            setSoldPrice("");
                          }
                        }}
                        disabled={!soldPrice}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CoinsList;
