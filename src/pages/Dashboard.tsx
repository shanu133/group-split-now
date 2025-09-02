import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Search, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Filter,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import GroupCard from '@/components/GroupCard';
import CreateGroupModal from '@/components/CreateGroupModal';
import AddExpenseModal from '@/components/AddExpenseModal';
import LoadingSkeleton from '@/components/LoadingIndicator';

interface Group {
  id: string;
  name: string;
  description?: string;
  members: Array<{
    id: string;
    name: string;
    avatar_url?: string;
  }>;
  created_at: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  payer?: {
    name: string;
    avatar_url?: string;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
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
  }, [groups, searchTerm, sortBy, sortOrder, filterAndSortGroups]);

  const filterAndSortGroups = useCallback(() => {
    let filtered = groups;
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
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
  }, [groups, searchTerm, sortBy, sortOrder]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`*, members:group_members(user:profiles(name, avatar_url))`)
        .order('created_at', { ascending: false });
      
      if (groupsError) throw groupsError;
      
      const transformedGroups = groupsData?.map(group => ({
        ...group,
        members: group.members.map((m: { user: { id: string; name: string; avatar_url?: string } }) => m.user),
      })) || [];
      
      setGroups(transformedGroups);
      setStats(s => ({ ...s, totalGroups: transformedGroups.length }));
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
          <div className="bg-gradient-to-r from-[#A97C50] to-[#8B5A3C] rounded-xl p-6 text-white animate-pulse">
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
        <div className="bg-gradient-to-r from-[#A97C50] to-[#8B5A3C] rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
          <p className="text-white/80">Manage your shared expenses and settle up with friends.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#A97C50]/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#A97C50]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Groups</p>
                <p className="text-2xl font-bold text-[#2E2E2E]">{stats.totalGroups}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#A97C50]/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#A97C50]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-[#2E2E2E]">{stats.totalExpenses}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#A97C50]/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#A97C50]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                <p className="text-2xl font-bold text-[#2E2E2E]">₹{stats.monthlyTotal.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Balance</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.owedAmount.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <Button onClick={handleCreateGroup} className="bg-[#A97C50] hover:bg-[#A97C50]/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
          <Button variant="outline" className="border-[#A97C50] text-[#A97C50] hover:bg-[#A97C50] hover:text-white">
            <Search className="w-4 h-4 mr-2" />
            Find Friends
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.length === 0 ? (
            <Card className="p-8 text-center col-span-2">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">No groups yet</h3>
              <p className="text-sm text-gray-500 mb-4">Create your first group to start splitting expenses with friends.</p>
              <Button onClick={handleCreateGroup} className="bg-[#A97C50] hover:bg-[#A97C50]/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </Card>
          ) : (
            filteredGroups.slice(0, 6).map((group) => (
              <GroupCard key={group.id} group={group} onViewGroup={handleViewGroup} />
            ))
          )}
        </div>
        
        {filteredGroups.length > 6 && (
          <Card className="p-6 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#A97C50] transition-colors">
            <Button variant="ghost" onClick={() => {}}>
              View {filteredGroups.length - 6} more groups
            </Button>
          </Card>
        )}
        
        <CreateGroupModal 
          open={showCreateGroup} 
          onOpenChange={setShowCreateGroup} 
          onGroupCreated={handleGroupCreated} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;