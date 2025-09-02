import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Profile } from '@/lib/supabase';
import { X } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupMembers: Profile[];
  onSave: (expenseData: {
    description: string;
    amount: number;
    selectedUsers: string[];
  }) => void;
}

const AddExpenseModal = ({ isOpen, onClose, groupMembers, onSave }: AddExpenseModalProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if (!description.trim() || !amount || selectedUsers.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        description: description.trim(),
        amount: parseFloat(amount),
        selectedUsers
      });
      
      // Reset form
      setDescription('');
      setAmount('');
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setAmount('');
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 border-gray-300 focus:border-[#A97C50] focus:ring-[#A97C50] rounded-lg"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Group Members Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#2E2E2E]">
              Who was part of this expense?
            </Label>
            <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {groupMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={member.id}
                    checked={selectedUsers.includes(member.id)}
                    onCheckedChange={() => handleUserToggle(member.id)}
                    className="border-gray-300 data-[state=checked]:bg-[#A97C50] data-[state=checked]:border-[#A97C50]"
                  />
                  <Label 
                    htmlFor={member.id} 
                    className="flex-1 text-sm text-[#2E2E2E] cursor-pointer"
                  >
                    {member.name}
                  </Label>
                </div>
              ))}
            </div>
            {selectedUsers.length === 0 && (
              <p className="text-xs text-red-500">Please select at least one person</p>
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
            disabled={!description.trim() || !amount || selectedUsers.length === 0 || loading}
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