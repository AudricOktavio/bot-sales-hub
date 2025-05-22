
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col justify-center items-center text-center max-w-4xl">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-crm-primary to-crm-secondary text-transparent bg-clip-text">
            AI Sales Agent CRM
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Revolutionize your sales process with AI-powered agents that generate leads, 
            engage customers, and close deals 24/7.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-crm-primary hover:bg-crm-primary/90"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
            >
              Log In
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="border rounded-xl p-6 bg-card shadow-sm hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-full bg-crm-primary/10 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-crm-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 1 0-16 0" />
                <line x1="12" y1="11" x2="12" y2="15" />
                <line x1="10" y1="13" x2="14" y2="13" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Agent Management</h3>
            <p className="text-muted-foreground">
              Create custom AI sales agents trained on your products and services. Tailor their personality and expertise.
            </p>
          </div>
          
          <div className="border rounded-xl p-6 bg-card shadow-sm hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-full bg-crm-secondary/10 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-crm-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 11h1a3 3 0 0 1 0 6h-1" />
                <path d="M9 12v6" />
                <path d="M13 12v6" />
                <path d="M14 3v4a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3" />
                <path d="M5 8h10" />
                <path d="M17 17v.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Pipeline Management</h3>
            <p className="text-muted-foreground">
              Visualize your sales funnel from lead to close. Track deals through every stage with real-time updates.
            </p>
          </div>
          
          <div className="border rounded-xl p-6 bg-card shadow-sm hover:shadow-md transition-all">
            <div className="h-12 w-12 rounded-full bg-crm-accent/10 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-crm-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M7 8h10" />
                <path d="M7 12h5" />
                <path d="M7 16h7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Conversation Analytics</h3>
            <p className="text-muted-foreground">
              Gain insights from every customer interaction. Identify trends and optimize sales strategies.
            </p>
          </div>
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">Ready to transform your sales process?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of businesses using AI-powered sales agents to increase efficiency, 
            generate more leads, and close more deals.
          </p>
          <Button 
            className="bg-crm-primary hover:bg-crm-primary/90"
            onClick={() => navigate('/signup')}
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
