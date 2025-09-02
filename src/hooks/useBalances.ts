import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserBalance {
  userId: string;
  name: string;
  avatar_url?: string;
  owes: number;
  owed: number;
  net: number;
}

interface DebtPair {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

interface BalanceState {
  userBalances: UserBalance[];
  currentUserBalance: UserBalance | null;
  simplifiedDebts: DebtPair[];
  loading: boolean;
  error: string | null;
}

interface BalanceData extends BalanceState {
  refetch: () => void;
}

export const useBalances = (groupId: string, currentUserId?: string): BalanceData => {
  const [balanceData, setBalanceData] = useState<BalanceState>({
    userBalances: [],
    currentUserBalance: null,
    simplifiedDebts: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (groupId) {
      calculateBalances();
    }
  }, [groupId, currentUserId]);

  const calculateBalances = async () => {
    try {
      setBalanceData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch group members
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          profiles!inner(name, avatar_url)
        `)
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      // Fetch expenses with splits
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          amount,
          paid_by,
          expense_splits(
            user_id,
            amount
          )
        `)
        .eq('group_id', groupId);

      if (expensesError) throw expensesError;

      // Fetch settlements
      const { data: settlementsData, error: settlementsError } = await supabase
        .from('settlements')
        .select('from_user_id, to_user_id, amount')
        .eq('group_id', groupId);

      if (settlementsError) throw settlementsError;

      // Initialize user balances
      const userBalances: { [userId: string]: UserBalance } = {};
      
      membersData?.forEach(member => {
        const profile = member.profiles as any;
        userBalances[member.user_id] = {
          userId: member.user_id,
          name: profile.name || 'Unknown',
          avatar_url: profile.avatar_url,
          owes: 0,
          owed: 0,
          net: 0,
        };
      });

      // Calculate balances from expenses
      expensesData?.forEach(expense => {
        const paidBy = expense.paid_by;
        const totalAmount = expense.amount;
        
        // Add to what the payer is owed
        if (userBalances[paidBy]) {
          userBalances[paidBy].owed += totalAmount;
        }

        // Subtract each person's share from what they owe
        expense.expense_splits?.forEach(split => {
          if (userBalances[split.user_id]) {
            userBalances[split.user_id].owes += split.amount;
            
            // If the person who paid also has a split, reduce their owed amount
            if (split.user_id === paidBy) {
              userBalances[paidBy].owed -= split.amount;
            }
          }
        });
      });

      // Apply settlements to reduce debts
      settlementsData?.forEach(settlement => {
        const fromUser = userBalances[settlement.from_user_id];
        const toUser = userBalances[settlement.to_user_id];
        
        if (fromUser && toUser) {
          fromUser.owes -= settlement.amount;
          toUser.owed -= settlement.amount;
        }
      });

      // Calculate net balances
      Object.values(userBalances).forEach(balance => {
        balance.net = balance.owed - balance.owes;
      });

      // Simplify debts using debt optimization algorithm
      const simplifiedDebts = simplifyDebts(Object.values(userBalances));

      setBalanceData({
        userBalances: Object.values(userBalances),
        currentUserBalance: currentUserId ? userBalances[currentUserId] || null : null,
        simplifiedDebts,
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error calculating balances:', error);
      setBalanceData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to calculate balances',
      }));
    }
  };

  const simplifyDebts = (balances: UserBalance[]): DebtPair[] => {
    const debts: DebtPair[] = [];
    const creditors = balances.filter(b => b.net > 0).sort((a, b) => b.net - a.net);
    const debtors = balances.filter(b => b.net < 0).sort((a, b) => a.net - b.net);

    let i = 0, j = 0;
    
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      
      const amount = Math.min(creditor.net, Math.abs(debtor.net));
      
      if (amount > 0.01) { // Ignore amounts less than 1 cent
        debts.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.name,
          toUserId: creditor.userId,
          toUserName: creditor.name,
          amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        });
      }
      
      creditor.net -= amount;
      debtor.net += amount;
      
      if (Math.abs(creditor.net) < 0.01) i++;
      if (Math.abs(debtor.net) < 0.01) j++;
    }
    
    return debts;
  };

  const refetch = () => {
    calculateBalances();
  };

  return { 
    ...balanceData, 
    refetch 
  };
};