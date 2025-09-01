import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Group, Expense } from '@/lib/supabase';
import DashboardLayout from '@/components/DashboardLayout';
import GroupCard from '@/components/GroupCard';
import ExpenseCard from '@/components/ExpenseCard';
import CreateGroupModal from '@/components/CreateGroupModal';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import QuickStatsCard from '@/components/QuickStatsCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, CreditCard, DollarSign, TrendingUp, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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

  useEffect(() => {
    filterAndSortGroups();
  }, [groups, searchTerm, sortBy, sortOrder]);

  const filterAndSortGroups = () => {
    let filtered = groups;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'date':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'members':
          compareValue = (a.members?.length || 0) - (b.members?.length || 0);
          break;
        default:
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    setFilteredGroups(filtered);
  };

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
    navigate(`/group/${group.id}`);
  };

  const handleCreateGroup = () => {
    setShowCreateGroup(true);
  };

  const handleGroupCreated = () => {
    fetchDashboardData();
    setShowCreateGroup(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="bg-gradient-hero rounded-xl p-6 text-white animate-pulse">
            <div className="h-6 bg-white/20 rounded w-48 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-80"></div>
          </div>
          <LoadingSkeleton type="stats" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LoadingSkeleton type="card" count={4} />
            </div>
            <div>
              <LoadingSkeleton type="list" count={3} />
            </div>
          </div>
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
          <QuickStatsCard
            title="Total Groups"
            value={stats.totalGroups}
            subtitle="Active groups"
            icon={Users}
            variant="default"
          />
          <QuickStatsCard
            title="Total Expenses"
            value={stats.totalExpenses}
            subtitle="This month"
            icon={CreditCard}
            variant="default"
          />
          <QuickStatsCard
            title="Monthly Total"
            value={`$${stats.monthlyTotal.toFixed(2)}`}
            subtitle="Total spent"
            icon={DollarSign}
            variant="default"
          />
          <QuickStatsCard
            title="Balance"
            value={`$${stats.owedAmount.toFixed(2)}`}
            subtitle="You're owed"
            icon={TrendingUp}
            variant="success"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 flex-wrap">
          <Button onClick={handleCreateGroup} className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Find Friends
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Groups</h2>
            </div>

            {/* Search and Filter */}
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortBy}
              onSortChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              placeholder="Search groups..."
            />

            {filteredGroups.length === 0 ? (
              groups.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No groups yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first group to start splitting expenses with friends.
                  </p>
                  <Button onClick={handleCreateGroup} className="bg-gradient-primary hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No groups found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your search terms or create a new group.
                  </p>
                  <Button onClick={() => setSearchTerm('')} variant="outline">
                    Clear Search
                  </Button>
                </Card>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {filteredGroups.slice(0, 6).map((group) => (
                  <GroupCard key={group.id} group={group} onViewGroup={handleViewGroup} />
                ))}
                {filteredGroups.length > 6 && (
                  <Card className="p-6 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                    <Button variant="ghost" onClick={() => {}}>
                      View {filteredGroups.length - 6} more groups
                    </Button>
                  </Card>
                )}
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

      <CreateGroupModal
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        onGroupCreated={handleGroupCreated}
      />
    </DashboardLayout>
  );
};

export default Dashboard;