import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: () => void;
}

const CreateGroupModal = ({ open, onOpenChange, onGroupCreated }: CreateGroupModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    memberEmails: [] as string[],
  });
  const [emailInput, setEmailInput] = useState('');

  const resetForm = () => {
    setFormData({ name: '', description: '', memberEmails: [] });
    setEmailInput('');
  };

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (formData.memberEmails.includes(email)) {
      toast.error('Email already added');
      return;
    }

    if (email === user?.email) {
      toast.error('You cannot add yourself to the group');
      return;
    }

    setFormData(prev => ({
      ...prev,
      memberEmails: [...prev.memberEmails, email]
    }));
    setEmailInput('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      memberEmails: prev.memberEmails.filter(email => email !== emailToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setLoading(true);

    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      // Add other members (if they exist in our system)
      if (formData.memberEmails.length > 0) {
        // First, check which emails exist in our system
        const { data: existingUsers, error: usersError } = await supabase
          .from('profiles')
          .select('id')
          .in('email', formData.memberEmails);

        if (usersError) {
          console.warn('Error checking existing users:', usersError);
        }

        if (existingUsers && existingUsers.length > 0) {
          const memberInserts = existingUsers.map(user => ({
            group_id: group.id,
            user_id: user.id,
          }));

          const { error: bulkMemberError } = await supabase
            .from('group_members')
            .insert(memberInserts);

          if (bulkMemberError) {
            console.warn('Error adding some members:', bulkMemberError);
          }
        }

        const foundCount = existingUsers?.length || 0;
        const notFoundCount = formData.memberEmails.length - foundCount;
        
        if (notFoundCount > 0) {
          toast.info(`Group created! ${notFoundCount} member(s) will need to sign up first to join.`);
        } else {
          toast.success('Group created successfully!');
        }
      } else {
        toast.success('Group created successfully!');
      }

      resetForm();
      onOpenChange(false);
      onGroupCreated();

    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to start splitting expenses with friends and family.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="e.g., Trip to Paris, Apartment 4B"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the group"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Add Members</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddEmail}
                disabled={!emailInput.trim()}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>

            {formData.memberEmails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.memberEmails.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Only users who have signed up can be added to groups. Others will need to create an account first.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;