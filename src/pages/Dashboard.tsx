import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Group, Expense } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AddExpenseModal from '@/components/AddExpenseModal';
import { 
  Plus, 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  Menu,
  X,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
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

  const handleSelectGroup = async (group: Group) => {
    setSelectedGroup(group);
    setSidebarOpen(false);
    
    // Fetch expenses for selected group
    try {
      const { data: expensesData, error } = await supabase
        .from('expenses')
        .select(`
          *,
          payer:profiles!expenses_paid_by_fkey(name, avatar_url),
          splits:expense_splits(
            amount,
            user:profiles(name, avatar_url)
          )
        `)
        .eq('group_id', group.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroupExpenses(expensesData || []);
    } catch (error) {
      console.error('Error fetching group expenses:', error);
      toast.error('Failed to load group expenses');
    }
  };

  const handleAddExpense = () => {
    if (!selectedGroup) {
      toast.error('Please select a group first');
      return;
    }
    setShowAddExpenseModal(true);
  };

  const handleSaveExpense = async (expenseData: {
    description: string;
    amount: number;
    selectedUsers: string[];
  }) => {
    if (!selectedGroup || !user) return;

    try {
      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          description: expenseData.description,
          amount: expenseData.amount,
          paid_by: user.id,
          group_id: selectedGroup.id,
          category: 'general'
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create expense splits for selected users
      const splits = expenseData.selectedUsers.map(userId => ({
        expense_id: expense.id,
        user_id: userId,
        amount: expenseData.amount / expenseData.selectedUsers.length
      }));

      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splits);

      if (splitsError) throw splitsError;

      toast.success('Expense added successfully!');
      
      // Refresh the expenses list
      if (selectedGroup) {
        handleSelectGroup(selectedGroup);
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A97C50]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#2E2E2E]">
      {/* New Responsive Dashboard Layout */}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-2xl font-bold text-[#A97C50]">ChaiPani</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-[#A97C50] text-white text-sm">
                  {profile?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">
                {profile?.name || user?.email}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="border-[#A97C50] text-[#A97C50] hover:bg-[#A97C50] hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:inset-0
        `}>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-[#2E2E2E]">Your Groups</h2>
            
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-500 mb-4">No groups yet</p>
                <Button 
                  size="sm" 
                  className="bg-[#A97C50] hover:bg-[#A97C50]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleSelectGroup(group)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-colors
                      ${selectedGroup?.id === group.id 
                        ? 'bg-[#A97C50] text-white' 
                        : 'hover:bg-gray-50 text-[#2E2E2E]'
                      }
                    `}
                  >
                    <div className="font-medium">{group.name}</div>
                    <div className={`text-xs ${selectedGroup?.id === group.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {group.members?.length || 0} members
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {selectedGroup ? (
            <div className="space-y-6">
              {/* Group Header */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-[#2E2E2E]">{selectedGroup.name}</h1>
                    <p className="text-gray-600">{selectedGroup.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#A97C50] text-[#A97C50] hover:bg-[#A97C50] hover:text-white"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#A97C50] text-[#A97C50] hover:bg-[#A97C50] hover:text-white"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expenses List */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-[#2E2E2E]">Expenses</h2>
                </div>
                
                {groupExpenses.length === 0 ? (
                  <div className="p-8 text-center">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium mb-2 text-[#2E2E2E]">No expenses yet</h3>
                    <p className="text-gray-500 mb-4">Add your first expense to get started.</p>
                    <Button 
                      className="bg-[#A97C50] hover:bg-[#A97C50]/90 text-white"
                      onClick={handleAddExpense}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {groupExpenses.map((expense) => (
                      <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-[#A97C50]/10 rounded-full flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-[#A97C50]" />
                            </div>
                            <div>
                              <h3 className="font-medium text-[#2E2E2E]">{expense.description}</h3>
                              <p className="text-sm text-gray-500">
                                Paid by {expense.payer?.name || 'Unknown'} • {new Date(expense.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-[#2E2E2E]">${expense.amount.toFixed(2)}</div>
                            <div className="text-sm text-gray-500">{expense.category}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2 text-[#2E2E2E]">Select a Group</h2>
                <p className="text-gray-500">Choose a group from the sidebar to view expenses</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#A97C50] hover:bg-[#A97C50]/90 text-white shadow-lg"
        onClick={handleAddExpense}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        groupMembers={selectedGroup?.members || []}
        onSave={handleSaveExpense}
      />
    </div>
  );
};

export default Dashboard;