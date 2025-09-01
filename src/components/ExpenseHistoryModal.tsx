import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Calendar, 
  DollarSign, 
  Users, 
  Filter,
  Loader2,
  Receipt
} from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseDetail {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  created_at: string;
  paid_by: string;
  payer: {
    name: string;
    avatar_url?: string;
  };
  splits: Array<{
    amount: number;
    user: {
      user_id: string;
      name: string;
      avatar_url?: string;
    };
  }>;
}

interface ExpenseHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
}

const ExpenseHistoryModal = ({
  open,
  onOpenChange,
  groupId,
  groupName,
}: ExpenseHistoryModalProps) => {
  const [expenses, setExpenses] = useState<ExpenseDetail[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Food', 'Transport', 'Entertainment', 'Accommodation', 'Other'];

  useEffect(() => {
    if (open && groupId) {
      fetchExpenses();
    }
  }, [open, groupId]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, selectedCategory]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const { data: expensesData, error } = await supabase
        .from('expenses')
        .select(`
          id,
          description,
          amount,
          date,
          category,
          created_at,
          paid_by,
          profiles!expenses_paid_by_fkey(name, avatar_url),
          expense_splits(
            amount,
            profiles(user_id, name, avatar_url)
          )
        `)
        .eq('group_id', groupId)
        .order('date', { ascending: false });

      if (error) throw error;

      const transformedExpenses = expensesData?.map(expense => ({
        ...expense,
        payer: expense.profiles as any,
        splits: expense.expense_splits?.map((split: any) => ({
          amount: split.amount,
          user: split.profiles,
        })) || [],
      })) || [];

      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.payer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    setFilteredExpenses(filtered);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Food: 'bg-orange-100 text-orange-800',
      Transport: 'bg-blue-100 text-blue-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      Accommodation: 'bg-green-100 text-green-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.Other;
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Expense History
          </DialogTitle>
          <DialogDescription>
            All expenses for {groupName} • Total: ${totalAmount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 py-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search expenses or people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {expenses.length === 0 ? 'No expenses found' : 'No expenses match your filters'}
              </p>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div key={expense.id} className="border rounded-lg p-4 space-y-3">
                {/* Expense Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{expense.description}</h3>
                      <Badge className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={expense.payer.avatar_url} />
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {getInitials(expense.payer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>Paid by {expense.payer.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      ${expense.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}
                    </div>
                  </div>
                </div>

                {/* Splits */}
                <div>
                  <Separator className="mb-3" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <Users className="w-4 h-4" />
                      Split between:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {expense.splits.map((split, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/50 rounded p-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={split.user.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {getInitials(split.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{split.user.name}</span>
                          </div>
                          <span className="font-medium text-sm">
                            ${split.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseHistoryModal;