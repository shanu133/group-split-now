import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '@/lib/supabase';
import { useBalances } from '@/hooks/useBalances';
import DashboardLayout from '@/components/DashboardLayout';
import ExpenseCard from '@/components/ExpenseCard';
import AddExpenseModal from '@/components/AddExpenseModal';
import BalanceCard from '@/components/BalanceCard';
import SettlementModal from '@/components/SettlementModal';
import ExpenseHistoryModal from '@/components/ExpenseHistoryModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Settings,
  Loader2,
  History,
  HandCoins
} from 'lucide-react';
import { toast } from 'sonner';

interface GroupMember {
  id: string;
  name: string;
  avatar_url?: string;
}

interface GroupData {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
  creator: GroupMember;
  members: GroupMember[];
}

interface ExpenseData {
  id: string;
  description: string;
  amount: number;
  date: string;
  paid_by: string;
  category: string;
  created_at: string;
  payer: GroupMember;
  splits: Array<{
    amount: number;
    user: GroupMember;
  }>;
}

interface DebtPair {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<GroupData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtPair | null>(null);

  // Use the balance calculation hook
  const { 
    userBalances, 
    currentUserBalance, 
    simplifiedDebts, 
    loading: balanceLoading, 
    refetch: refetchBalances 
  } = useBalances(groupId || '', user?.id);

  useEffect(() => {
    if (groupId && user) {
      fetchGroupData();
    }
  }, [groupId, user]);

  const fetchGroupData = async () => {
    if (!groupId || !user) return;

    try {
      setLoading(true);

      // Fetch basic group info
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) {
        if (groupError.code === 'PGRST116') {
          toast.error('Group not found');
          navigate('/dashboard');
          return;
        }
        throw groupError;
      }

      // Fetch group members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // Fetch profiles for members
      const memberIds = membersData?.map(m => m.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', memberIds);

      if (profilesError) throw profilesError;

      // Transform group data
      const transformedGroup: GroupData = {
        ...groupData,
        creator: profilesData?.find(p => p.user_id === groupData.created_by) || { id: '', name: 'Unknown' },
        members: profilesData?.map(p => ({ id: p.user_id, name: p.name || 'Unknown', avatar_url: p.avatar_url })) || [],
      };

      setGroup(transformedGroup);

      // Fetch basic expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      // Set basic expenses for now (without complex joins)
      setExpenses(expensesData || []);

    } catch (error) {
      console.error('Error fetching group data:', error);
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleSettleUp = (debt: DebtPair) => {
    setSelectedDebt(debt);
    setShowSettlement(true);
  };

  const handleSettlementAdded = () => {
    refetchBalances();
    setShowSettlement(false);
    setSelectedDebt(null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleExpenseAdded = async () => {
    await fetchGroupData();
    refetchBalances();
    setShowAddExpense(false);
    toast.success('Expense added successfully!');
  };

  if (loading || balanceLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Group not found</h2>
          <p className="text-muted-foreground mb-4">The group you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              {group.description && (
                <p className="text-muted-foreground">{group.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex gap-2">
              <Button onClick={() => setShowAddExpense(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
              <Button variant="outline" onClick={() => setShowHistory(true)}>
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">You Owe</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ${(currentUserBalance?.owes || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">You're Owed</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ${(currentUserBalance?.owed || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (currentUserBalance?.net || 0) > 0 ? 'text-success' : 
                (currentUserBalance?.net || 0) < 0 ? 'text-destructive' : 
                'text-muted-foreground'
              }`}>
                ${Math.abs(currentUserBalance?.net || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {(currentUserBalance?.net || 0) > 0 ? 'you are owed' : 
                 (currentUserBalance?.net || 0) < 0 ? 'you owe' : 
                 'all settled up'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{expenses.length}</div>
              <p className="text-xs text-muted-foreground">
                ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)} total
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balances & Expenses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balances Section */}
            {simplifiedDebts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Balances</h2>
                  <Button variant="ghost" size="sm">
                    <HandCoins className="w-4 h-4 mr-2" />
                    Settle All
                  </Button>
                </div>
                <div className="space-y-3">
                  {simplifiedDebts.map((debt, index) => (
                    <BalanceCard
                      key={`${debt.fromUserId}-${debt.toUserId}-${index}`}
                      debt={debt}
                      currentUserId={user?.id || ''}
                      onSettleUp={handleSettleUp}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Expenses Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Expenses</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)}>
                  View All
                </Button>
              </div>

            {expenses.length === 0 ? (
              <Card className="p-8 text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No expenses yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first expense to start tracking spending in this group.
                </p>
                <Button onClick={() => setShowAddExpense(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </div>
            )}
            </div>
          </div>

          {/* Group Members */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Group Members</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {group.members.length} Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.members.map((member, index) => (
                  <div key={member.id}>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        {member.id === group.created_by && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                      </div>
                    </div>
                    {index < group.members.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        group={group}
        onExpenseAdded={handleExpenseAdded}
      />

      <SettlementModal
        open={showSettlement}
        onOpenChange={setShowSettlement}
        debt={selectedDebt}
        groupId={groupId || ''}
        onSettlementAdded={handleSettlementAdded}
      />

      <ExpenseHistoryModal
        open={showHistory}
        onOpenChange={setShowHistory}
        groupId={groupId || ''}
        groupName={group?.name || ''}
      />
    </DashboardLayout>
  );
};

export default GroupDetail;