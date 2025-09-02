import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, X } from 'lucide-react';
import { toast } from 'sonner'; // or your toast library
// import { Profile } from '@/lib/supabase';


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
  'Other'
];


const AddExpenseModal = ({ open, onOpenChange, group, onExpenseAdded }: AddExpenseModalProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    paidBy: user?.id || '',
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [loading, setLoading] = useState(false);

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
    setSplitType('equal');
  };

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId]);
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    }
  };

  const calculateEqualSplits = useCallback(() => {
    const amount = parseFloat(formData.amount);
    if (!amount || selectedMembers.length === 0) return;

    const equalAmount = amount / selectedMembers.length;
    const newSplits = selectedMembers.map(memberId => ({
      userId: memberId,
      amount: equalAmount,
    }));
    setSplits(newSplits);
  }, [formData.amount, selectedMembers]);

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };


  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSave = async () => {
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

    const totalSplit = getTotalSplitAmount();
    if (Math.abs(totalSplit - amount) > 0.01) {
      toast.error(`Split amounts (${totalSplit.toFixed(2)}) don't match expense amount (${amount.toFixed(2)})`);
      return;
    }

    setLoading(true);
    try {
      // Save expense logic here (call your API or Supabase)
      // Example:
      // await supabase.from('expenses').insert({...});
      toast.success('Expense added!');
      resetForm();
      onOpenChange(false);
      onExpenseAdded();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate equal splits when amount or selected members change
  useEffect(() => {
    if (splitType === 'equal' && formData.amount && selectedMembers.length > 0) {
      calculateEqualSplits();
    }
  }, [formData.amount, selectedMembers, splitType, calculateEqualSplits]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-xl shadow-lg border border-gray-200">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-[#2E2E2E]">
              Add Expense
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-[#2E2E2E]">
              Description
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Lunch at a restaurant"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="border-gray-300 focus:border-[#A97C50] focus:ring-[#A97C50] rounded-lg"
            />
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-[#2E2E2E]">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2E2E2E] font-medium">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="pl-8 border-gray-300 focus:border-[#A97C50] focus:ring-[#A97C50] rounded-lg"
                min="0"
                step="0.01"
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
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant={splitType === 'equal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSplitType('equal')}
                >
                  Equal Split
                </Button>
                <Button
                  type="button"
                  variant={splitType === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSplitType('custom')}
                >
                  Custom Split
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {group.members.map((member) => {
                const isSelected = selectedMembers.includes(member.id);
                const splitAmount = splits.find(s => s.userId === member.id)?.amount || 0;

                return (
                  <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg border">
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
                    {isSelected && splitType === 'custom' && (
                      <div className="w-24">
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
                    {isSelected && splitType === 'equal' && (
                      <div className="w-24 text-right font-medium text-primary">
                        ₹{splitAmount.toFixed(2)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {selectedMembers.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4" />
                  <span className="font-medium">Total Split:</span>
                </div>
                <span className={`font-bold ${
                  Math.abs(getTotalSplitAmount() - parseFloat(formData.amount || '0')) < 0.01 
                    ? 'text-success' 
                    : 'text-destructive'
                }`}>
                  ₹{getTotalSplitAmount().toFixed(2)} / ₹{formData.amount || '0.00'}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-gray-300 text-[#2E2E2E] hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !formData.description.trim() ||
              !formData.amount ||
              selectedMembers.length === 0 ||
              loading
            }
            className="bg-[#A97C50] hover:bg-[#A97C50]/90 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;