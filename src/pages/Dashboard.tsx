import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Group, Expense } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import GroupCard from '@/components/GroupCard';
import ExpenseCard from '@/components/ExpenseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    monthlyTotal: 0,
    owedAmount: 0,
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          *,
          creator:profiles!groups_created_by_fkey(name, avatar_url),
          members:group_members(
            user_id,
            user:profiles(name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // Transform the data to match our types
      const transformedGroups = groupsData?.map(group => ({
        ...group,
        members: group.members.map((m: any) => m.user),
      })) || [];

      setGroups(transformedGroups);

      // Fetch recent expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          payer:profiles!expenses_paid_by_fkey(name, avatar_url),
          splits:expense_splits(
            amount,
            user:profiles(name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (expensesError) throw expensesError;
      setRecentExpenses(expensesData || []);

      // Calculate stats
      setStats({
        totalGroups: transformedGroups.length,
        totalExpenses: expensesData?.length || 0,
        monthlyTotal: expensesData?.reduce((sum, exp) => sum + exp.amount, 0) || 0,
        owedAmount: 0, // This would need more complex calculation
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewGroup = (group: Group) => {
    toast.info(`Viewing ${group.name} - Full group view coming soon!`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
          <p className="text-white/80">
            Manage your shared expenses and settle up with friends.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalGroups}</div>
              <p className="text-xs text-muted-foreground">Active groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalExpenses}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${stats.monthlyTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total spent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">${stats.owedAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">You're owed</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Groups</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            {groups.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No groups yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first group to start splitting expenses with friends.
                </p>
                <Button className="bg-gradient-primary hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.slice(0, 4).map((group) => (
                  <GroupCard key={group.id} group={group} onViewGroup={handleViewGroup} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Recent Expenses</h2>
            
            {recentExpenses.length === 0 ? (
              <Card className="p-6 text-center">
                <CreditCard className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-medium mb-1">No expenses yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add your first expense to get started.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;