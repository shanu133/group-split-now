import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface GroupMember {
  id: string;
  name: string;
  avatar_url?: string;
}

interface GroupData {
  id: string;
  name: string;
  members: GroupMember[];
}

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupData;
  onExpenseAdded: () => void;
}

interface ExpenseSplit {
  userId: string;
  amount: number;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation', 
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Groceries',
  'Bills',
  'Other'
];

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal Split', icon: '÷' },
  { value: 'exact', label: 'Exact Amounts', icon: '$' },
  { value: 'percentage', label: 'Percentages', icon: '%' }
] as const;

type SplitType = typeof SPLIT_TYPES[number]['value'];

const AddExpenseModal = ({ open, onOpenChange, group, onExpenseAdded }: AddExpenseModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    paidBy: user?.id || '',
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [splitType, setSplitType] = useState<SplitType>('equal');

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Other',
      paidBy: user?.id || '',
    });
    setSelectedMembers([]);
    setSplits([]);
    setPercentages({});
    setSplitType('equal');
  };

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  const calculateEqualSplits = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || selectedMembers.length === 0) return;

    const equalAmount = amount / selectedMembers.length;
    const newSplits = selectedMembers.map(memberId => ({
      userId: memberId,
      amount: equalAmount,
    }));
    setSplits(newSplits);
  };

  const calculatePercentageSplits = () => {
    const amount = parseFloat(formData.amount);
    if (!amount) return;

    const newSplits = selectedMembers.map(memberId => {
      const percentage = percentages[memberId] || 0;
      return {
        userId: memberId,
        amount: (amount * percentage) / 100,
      };
    });
    setSplits(newSplits);
  };

  const handlePercentageChange = (userId: string, percentage: string) => {
    const numPercentage = parseFloat(percentage) || 0;
    setPercentages(prev => ({ ...prev, [userId]: numPercentage }));
  };

  const handleSplitAmountChange = (userId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setSplits(prev => {
      const existing = prev.find(s => s.userId === userId);
      if (existing) {
        return prev.map(s => s.userId === userId ? { ...s, amount: numAmount } : s);
      } else {
        return [...prev, { userId, amount: numAmount }];
      }
    });
  };

  const getTotalSplitAmount = () => {
    return splits.reduce((sum, split) => sum + split.amount, 0);
  };

  const getTotalPercentage = () => {
    return selectedMembers.reduce((sum, memberId) => sum + (percentages[memberId] || 0), 0);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member to split with');
      return;
    }

    // Validate splits based on split type
    if (splitType === 'percentage') {
      const totalPercentage = getTotalPercentage();
      if (Math.abs(totalPercentage - 100) > 0.01) {
        toast.error(`Percentages must add up to 100% (current: ${totalPercentage.toFixed(1)}%)`);
        return;
      }
    } else {
      const totalSplit = getTotalSplitAmount();
      if (Math.abs(totalSplit - amount) > 0.01) {
        toast.error(`Split amounts ($${totalSplit.toFixed(2)}) don't match expense amount ($${amount.toFixed(2)})`);
        return;
      }
    }

    setLoading(true);

    try {
      // Create the expense
      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          description: formData.description.trim(),
          amount: amount,
          date: formData.date,
          paid_by: formData.paidBy,
          group_id: group.id,
          category: formData.category,
        })
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create the expense splits
      const splitInserts = splits.map(split => ({
        expense_id: expense.id,
        user_id: split.userId,
        amount: split.amount,
      }));

      const { error: splitsError } = await supabase
        .from('expense_splits')
        .insert(splitInserts);

      if (splitsError) throw splitsError;

      toast.success('Expense added successfully!');
      resetForm();
      onOpenChange(false);
      onExpenseAdded();

    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate splits when relevant data changes
  React.useEffect(() => {
    if (formData.amount && selectedMembers.length > 0) {
      if (splitType === 'equal') {
        calculateEqualSplits();
      } else if (splitType === 'percentage') {
        calculatePercentageSplits();
      }
    }
  }, [formData.amount, selectedMembers, splitType, percentages]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add an expense to {group.name} and split it among members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Dinner at restaurant"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Paid By */}
          <div className="space-y-2">
            <Label>Paid By</Label>
            <Select value={formData.paidBy} onValueChange={(value) => setFormData(prev => ({ ...prev, paidBy: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {group.members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Split Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Split Between</Label>
              <div className="flex items-center space-x-1">
                {SPLIT_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={splitType === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSplitType(type.value)}
                    className="flex items-center gap-1"
                  >
                    <span className="text-sm">{type.icon}</span>
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {group.members.map((member) => {
                const isSelected = selectedMembers.includes(member.id);
                const splitAmount = splits.find(s => s.userId === member.id)?.amount || 0;
                const memberPercentage = percentages[member.id] || 0;

                return (
                  <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-card">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleMemberToggle(member.id, checked as boolean)}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.avatar_url} alt={member.name} />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                    </div>
                    
                    {isSelected && splitType === 'exact' && (
                      <div className="w-28">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={splitAmount || ''}
                          onChange={(e) => handleSplitAmountChange(member.id, e.target.value)}
                          className="text-right"
                        />
                      </div>
                    )}
                    
                    {isSelected && splitType === 'percentage' && (
                      <div className="w-28 flex items-center gap-1">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={memberPercentage || ''}
                          onChange={(e) => handlePercentageChange(member.id, e.target.value)}
                          className="text-right"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    )}
                    
                    {isSelected && splitType === 'equal' && (
                      <div className="w-28 text-right">
                        <span className="font-medium text-primary">${splitAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {isSelected && splitType === 'percentage' && (
                      <div className="w-20 text-right">
                        <span className="text-sm font-medium text-muted-foreground">
                          ${splitAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedMembers.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4" />
                  <span className="font-medium">
                    {splitType === 'percentage' ? 'Total Percentage:' : 'Total Split:'}
                  </span>
                </div>
                <div className="text-right">
                  {splitType === 'percentage' ? (
                    <span className={`font-bold ${
                      Math.abs(getTotalPercentage() - 100) < 0.01 
                        ? 'text-success' 
                        : 'text-destructive'
                    }`}>
                      {getTotalPercentage().toFixed(1)}% / 100%
                    </span>
                  ) : (
                    <span className={`font-bold ${
                      Math.abs(getTotalSplitAmount() - parseFloat(formData.amount || '0')) < 0.01 
                        ? 'text-success' 
                        : 'text-destructive'
                    }`}>
                      ${getTotalSplitAmount().toFixed(2)} / ${formData.amount || '0.00'}
                    </span>
                  )}
                  {splitType === 'percentage' && (
                    <div className="text-sm text-muted-foreground">
                      Total: ${getTotalSplitAmount().toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || selectedMembers.length === 0 || !formData.amount || !formData.description.trim()}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;