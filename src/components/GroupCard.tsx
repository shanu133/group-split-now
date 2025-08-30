import { Group } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, Plus } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  onViewGroup: (group: Group) => void;
}

const GroupCard = ({ group, onViewGroup }: GroupCardProps) => {
  const memberCount = group.members?.length || 0;
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="hover:shadow-card transition-shadow cursor-pointer" onClick={() => onViewGroup(group)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {memberCount}
          </Badge>
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground">{group.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Member avatars */}
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {group.members?.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={member.avatar_url} alt={member.name} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {memberCount > 4 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  +{memberCount - 4}
                </span>
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground ml-2">members</span>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              // Add expense functionality
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Expense
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // View balances functionality
            }}
          >
            <DollarSign className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;