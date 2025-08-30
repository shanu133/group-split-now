import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, BarChart3, Shield, CheckCircle, ArrowRight } from 'lucide-react';

const Index = () => {
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
      <header className="border-b bg-card shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SplitWise
            </h1>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-primary hover:opacity-90">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Split Expenses Like a Pro
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
                Why choose SplitWise?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of users who trust SplitWise to manage their shared expenses. 
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
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SplitWise
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
