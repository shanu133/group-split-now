import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, DollarSign } from 'lucide-react';

interface DebtPair {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

interface BalanceCardProps {
  debt: DebtPair;
  currentUserId: string;
  onSettleUp: (debt: DebtPair) => void;
}

const BalanceCard = ({ debt, currentUserId, onSettleUp }: BalanceCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isCurrentUserInvolved = debt.fromUserId === currentUserId || debt.toUserId === currentUserId;
  const currentUserOwes = debt.fromUserId === currentUserId;
  const currentUserOwed = debt.toUserId === currentUserId;

  return (
    <Card className={`transition-all duration-200 ${
      isCurrentUserInvolved ? 'border-primary/50 bg-primary/5' : 'hover:shadow-md'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Debt Information */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`text-white ${
                  currentUserOwes ? 'bg-destructive' : 'bg-muted-foreground'
                }`}>
                  {getInitials(debt.fromUserName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {debt.fromUserId === currentUserId ? 'You' : debt.fromUserName}
                </p>
                <p className="text-xs text-muted-foreground">owes</p>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-sm">
                  {debt.toUserId === currentUserId ? 'You' : debt.toUserName}
                </p>
                <p className="text-xs text-muted-foreground">receives</p>
              </div>
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`text-white ${
                  currentUserOwed ? 'bg-success' : 'bg-muted-foreground'
                }`}>
                  {getInitials(debt.toUserName)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center px-4">
              <div className="text-lg font-bold text-primary">
                ${debt.amount.toFixed(2)}
              </div>
              {isCurrentUserInvolved && (
                <Badge variant={currentUserOwes ? 'destructive' : 'default'} className="text-xs">
                  {currentUserOwes ? 'You owe' : 'You\'re owed'}
                </Badge>
              )}
            </div>
          </div>

          {/* Settle Up Button */}
          {isCurrentUserInvolved && (
            <Button
              onClick={() => onSettleUp(debt)}
              variant={currentUserOwed ? 'default' : 'outline'}
              size="sm"
              className={currentUserOwed ? 'bg-gradient-success hover:opacity-90' : ''}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Settle Up
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;