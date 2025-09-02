import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, BarChart3, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google successfully!');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup was blocked by your browser. Please allow popups and try again.');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Group Management',
      description: 'Create groups for different occasions and easily manage members.'
    },
    {
      icon: CreditCard,
      title: 'Smart Expense Tracking',
      description: 'Add expenses and split them fairly among group members automatically.'
    },
    {
      icon: BarChart3,
      title: 'Balance Calculations',
      description: 'See who owes what with real-time balance calculations and settlement suggestions.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is protected with enterprise-grade security.'
    }
  ];

  const benefits = [
    'Split expenses equally or by custom amounts',
    'Track spending across multiple groups',
    'Settle debts with integrated payment reminders',
    'Export expense reports for tax purposes',
    'Real-time synchronization across all devices',
    'Offline mode for adding expenses anywhere'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary">
              ChaiPani
            </h1>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90 text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Split Chai & Pani Like a Pro
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            The easiest way to share bills, track group expenses, and settle up with friends. 
            Never worry about who owes what again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                Start Splitting for Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
          
          <div className="mt-6">
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to split expenses</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to make group expense management effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center shadow-card hover:shadow-primary transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Why choose ChaiPani?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of users who trust ChaiPani to manage their shared expenses. 
                From roommates to travel groups, we make splitting costs simple and transparent.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-success rounded-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-white/90 mb-6">
                Create your first group and start tracking expenses in under 60 seconds.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold w-full">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-primary">
              ChaiPani
            </h3>
          </div>
          <p className="text-muted-foreground">
            Making expense splitting simple and fair for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
