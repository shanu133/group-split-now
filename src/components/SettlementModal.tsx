import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DebtPair {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

interface SettlementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: DebtPair | null;
  groupId: string;
  onSettlementAdded: () => void;
}

const SettlementModal = ({
  open,
  onOpenChange,
  debt,
  groupId,
  onSettlementAdded,
}: SettlementModalProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!debt || !amount) {
      toast.error('Please enter a valid amount');
      return;
    }

    const settlementAmount = parseFloat(amount);
    if (settlementAmount <= 0 || settlementAmount > debt.amount) {
      toast.error(`Amount must be between $0.01 and $${debt.amount.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('settlements')
        .insert({
          group_id: groupId,
          from_user_id: debt.fromUserId,
          to_user_id: debt.toUserId,
          amount: settlementAmount,
          description: description || `Settlement from ${debt.fromUserName} to ${debt.toUserName}`,
        });

      if (error) throw error;

      toast.success('Settlement recorded successfully!');
      onSettlementAdded();
      onOpenChange(false);
      
      // Reset form
      setAmount('');
      setDescription('');
      
    } catch (error) {
      console.error('Error recording settlement:', error);
      toast.error('Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Set default amount when debt changes
  useEffect(() => {
    if (debt) {
      setAmount(debt.amount.toFixed(2));
    }
  }, [debt]);

  if (!debt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Record Settlement
          </DialogTitle>
          <DialogDescription>
            Mark this debt as settled between group members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Settlement Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-destructive/10 text-destructive">
                    {getInitials(debt.fromUserName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{debt.fromUserName}</p>
                  <p className="text-sm text-muted-foreground">Paying</p>
                </div>
              </div>
              
              <div className="text-center px-4">
                <div className="text-2xl font-bold text-primary">
                  ${debt.amount.toFixed(2)}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium">{debt.toUserName}</p>
                  <p className="text-sm text-muted-foreground">Receiving</p>
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-success/10 text-success">
                    {getInitials(debt.toUserName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Settlement Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max={debt.amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum: ${debt.amount.toFixed(2)}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Cash payment for dinner expenses"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !amount}
              className="bg-gradient-primary hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Settlement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SettlementModal;