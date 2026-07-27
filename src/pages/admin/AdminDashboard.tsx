import { ShoppingBag, Users, DollarSign, Package } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetsQuery } from "@/api/apiSlice";
import { endpoints } from "@/api/config";
import type { BestSellerProduct } from "@/types";

const fmtPKR = (n: number) => `PKR ${(n / 1000).toFixed(0)}k`;

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) => (
  <div className="bg-card border border-border rounded-lg p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent" />
      </div>
    </div>
    <p className="text-[9px] tracking-[0.3em] text-muted-foreground mb-1">
      {label}
    </p>
    <p className="font-serif text-xl text-foreground">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useGetsQuery(endpoints.dashboardRoutes.overview, {
    refetchOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground tracking-[0.1em]">
          Loading dashboard metrics...
        </p>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-destructive tracking-[0.1em]">
          Failed to load dashboard data. Please try again.
        </p>
      </div>
    );
  }

  const { topCards = {}, charts = {}, bestSellers = [] } = dashboardData;
  const revenueData = charts.salesOverTime || [];
  const categoryData = charts.salesByCategory || [];

  const stats = [
    {
      icon: DollarSign,
      label: "TOTAL REVENUE",
      value: `PKR ${topCards.totalRevenue?.toLocaleString() || 0}`,
    },
    {
      icon: ShoppingBag,
      label: "ORDERS",
      value: String(topCards.totalOrders || 0),
    },
    {
      icon: Users,
      label: "CUSTOMERS",
      value: String(topCards.totalCustomers || 0),
    },
    {
      icon: DollarSign,
      label: "AVG. ORDER VALUE",
      value: `PKR ${topCards.avgOrderValue?.toLocaleString() || 0}`,
    },
    {
      icon: Package,
      label: "PRODUCTS LIVE",
      value: String(topCards.productsLive || 0),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <p className="text-[10px] tracking-[0.4em] text-accent mb-2">
          OVERVIEW
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Welcome back. Here's how BAMBOTIA is performing today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= REVENUE CHART ================= */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 pt-8 overflow-hidden">
          {/* Header */}
          <div className="mb-6">
            <p className="text-[10px] tracking-[0.4em] text-accent mb-1">
              REVENUE
            </p>
            <h3 className="font-serif text-xl text-foreground">
              Sales Over Time
            </h3>
          </div>

          {/* Chart */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--accent)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--accent)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />

                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickFormatter={fmtPKR}
                />

                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [
                    `PKR ${v.toLocaleString()}`,
                    "Revenue",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ================= CATEGORY CHART ================= */}
        <div className="bg-card border border-border rounded-lg p-5 overflow-hidden">
          {/* Header */}
          <div className="mb-6">
            <p className="text-[10px] tracking-[0.4em] text-accent mb-1">
              CATEGORIES
            </p>
            <h3 className="font-serif text-xl text-foreground">
              Sales by Category
            </h3>
          </div>

          {/* Chart */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />{" "}
                <Bar
                  dataKey="sales"
                  fill="var(--accent)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="mb-6">
          <p className="text-[10px] tracking-[0.4em] text-accent mb-1">
            BEST SELLERS
          </p>
          <h3 className="font-serif text-xl text-foreground">Top Products</h3>
        </div>
        <div className="space-y-3">
          {bestSellers.map((p: BestSellerProduct, i: number) => (
            <div
              key={p.name || i}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-4">
                <span className="font-serif text-2xl text-accent w-8">
                  {String(p.rank).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.unitsSold || 0} units sold
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">
                PKR {(p.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
