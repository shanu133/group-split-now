import { Expense } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      shopping: 'bg-pink-100 text-pink-800',
      utilities: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  return (
    <Card className="hover:shadow-card transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Payer avatar */}
            <Avatar className="w-10 h-10">
              <AvatarImage src={expense.payer?.avatar_url} alt={expense.payer?.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {expense.payer?.name ? getInitials(expense.payer.name) : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Expense description */}
              <h3 className="font-medium text-foreground truncate">{expense.description}</h3>
              
              {/* Payer info */}
              <p className="text-sm text-muted-foreground">
                Paid by {expense.payer?.name}
              </p>

              {/* Category and date */}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className={getCategoryColor(expense.category)}>
                  {expense.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(expense.date), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className="font-semibold text-lg text-primary">
              ${expense.amount.toFixed(2)}
            </p>
            {expense.splits && (
              <p className="text-xs text-muted-foreground">
                Split {expense.splits.length} ways
              </p>
            )}
          </div>
        </div>

        {/* Split preview */}
        {expense.splits && expense.splits.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Split between:</span>
              <div className="flex -space-x-1">
                {expense.splits.slice(0, 3).map((split) => (
                  <Avatar key={split.user_id} className="w-6 h-6 border border-background">
                    <AvatarImage src={split.user?.avatar_url} alt={split.user?.name} />
                    <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                      {split.user?.name ? getInitials(split.user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {expense.splits.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted border border-background flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      +{expense.splits.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;