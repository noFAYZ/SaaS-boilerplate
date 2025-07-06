'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Tab, 
  Tabs, 
  Badge, 
  Button, 
  Skeleton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Progress,
  Avatar,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  toast
} from '@heroui/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Layers, 
  RefreshCw,
  Calendar,
  Target,
  BarChart3,
  Coins,
  ChevronDown,
  ExternalLink,
  Copy,
  AlertCircle
} from 'lucide-react';
import { zerionUtils, WalletData, WalletSummary } from '@/lib/zerion';
import { ResponsiveLayout } from '@/components/layouts/ResponsiveLayout';
import { WalletAnalytics } from '@/components/WalletAnalytics/WalletAnalytics';


// Types for chart data
interface ChartDataPoint {
  timestamp: number;
  value: number;
  date: string;
}

interface TokenPosition {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  value: number;
  price: number;
  change24h: number;
  weight: number;
  logo?: string;
  chain: string;
}

interface NFTAsset {
  id: string;
  name: string;
  collection: string;
  image: string;
  floorPrice?: number;
  lastSale?: number;
}

// Color palette for charts
const CHART_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316'
];

export default function WalletAnalyticsPage() {
  const params = useParams();
  const address = params?.address as string;
  
  // State management
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());




  // Error state
  if (error) {
    return (
      <ResponsiveLayout>
        <Card className="border-danger-200">
          <CardBody className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Wallet</h3>
            <p className="text-default-500 mb-4">{error}</p>
            <Button color="primary" onPress={fetchWalletData}>
              Try Again
            </Button>
          </CardBody>
        </Card>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout >
      <div className='flex max-w-7xl justify-center '>
    <WalletAnalytics 
                address={address}
                showBalance={true}
                onShowBalanceChange={() => {}}
              /></div>
    </ResponsiveLayout>
  );
}