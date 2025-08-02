
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, MessageCircle, TrendingUp, Clock, Users, CheckCircle } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Demo conversation data
  const demos = [
    {
      title: "E-commerce Sales Agent",
      industry: "Retail",
      messages: [
        { sender: 'bot', text: "Hi! I'm Sarah, your personal shopping assistant. Looking for something special today?", delay: 1000 },
        { sender: 'customer', text: "Hi! I need a laptop for graphic design work", delay: 2000 },
        { sender: 'bot', text: "Perfect! For graphic design, I'd recommend our MacBook Pro 16\" with M3 Max chip. It has exceptional performance for design work. Would you like to see the specs?", delay: 3000 },
        { sender: 'customer', text: "Yes, that sounds great!", delay: 4000 },
        { sender: 'bot', text: "✅ Deal closed: $2,499 MacBook Pro 16\"", delay: 5000, isResult: true }
      ]
    },
    {
      title: "Real Estate Agent",
      industry: "Property",
      messages: [
        { sender: 'bot', text: "Hello! I'm Alex from Prime Properties. Are you looking to buy or sell?", delay: 1000 },
        { sender: 'customer', text: "I'm looking for a 3-bedroom house under $500k", delay: 2000 },
        { sender: 'bot', text: "Great! I have 3 properties that match perfectly. All in excellent neighborhoods with good schools. When would you like to schedule viewings?", delay: 3000 },
        { sender: 'customer', text: "This weekend would be perfect", delay: 4000 },
        { sender: 'bot', text: "📅 3 viewings scheduled for Saturday 10am-2pm", delay: 5000, isResult: true }
      ]
    },
    {
      title: "SaaS Sales Agent",
      industry: "Technology",
      messages: [
        { sender: 'bot', text: "Hi there! I'm Emma from CloudFlow. I see you're interested in our project management solution?", delay: 1000 },
        { sender: 'customer', text: "Yes, my team of 20 needs better collaboration tools", delay: 2000 },
        { sender: 'bot', text: "Perfect fit! Our Enterprise plan supports unlimited team members with advanced reporting. I can offer you a 30-day trial and 20% off the first year. Interested?", delay: 3000 },
        { sender: 'customer', text: "That sounds like exactly what we need!", delay: 4000 },
        { sender: 'bot', text: "💼 Trial started + 20% discount applied ($2,400/year)", delay: 5000, isResult: true }
      ]
    }
  ];

  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);

  useEffect(() => {
    const currentDemoData = demos[currentDemo];
    setDisplayedMessages([]);
    setIsTyping(false);

    const showMessages = async () => {
      for (let i = 0; i < currentDemoData.messages.length; i++) {
        const message = currentDemoData.messages[i];
        
        await new Promise(resolve => setTimeout(resolve, message.delay));
        
        if (message.sender === 'bot') {
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIsTyping(false);
        }
        
        setDisplayedMessages(prev => [...prev, message]);
      }
    };

    showMessages();
  }, [currentDemo]);

  const stats = [
    { label: "Increase in Sales", value: "340%", icon: TrendingUp },
    { label: "Response Time", value: "<30s", icon: Clock },
    { label: "Customer Satisfaction", value: "94%", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 bg-crm-primary/10 text-crm-primary hover:bg-crm-primary/20">
            Built by AI Experts for Sales Teams
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-crm-primary to-crm-secondary text-transparent bg-clip-text animate-fade-in">
            AI Sales Agents That Actually Close Deals
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Deploy human-like AI sales agents that engage customers 24/7, qualify leads instantly, 
            and boost your conversion rates by 340%. No coding required.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-crm-primary hover:bg-crm-primary/90 group"
              onClick={() => navigate('/signup')}
            >
              <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Try Live Demo
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
            >
              Watch in Action
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-crm-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Demo Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See AI Sales Agents in Action
            </h2>
            <p className="text-muted-foreground text-lg">
              Watch real conversations and see how AI agents convert leads across different industries
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Demo Selector */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Choose a Demo:</h3>
              {demos.map((demo, index) => (
                <Card 
                  key={index}
                  className={`p-4 cursor-pointer transition-all border-2 hover:shadow-md ${
                    currentDemo === index 
                      ? 'border-crm-primary bg-crm-primary/5' 
                      : 'border-border hover:border-crm-primary/50'
                  }`}
                  onClick={() => setCurrentDemo(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{demo.title}</h4>
                      <p className="text-sm text-muted-foreground">{demo.industry}</p>
                    </div>
                    <div className={`h-3 w-3 rounded-full transition-colors ${
                      currentDemo === index ? 'bg-crm-primary' : 'bg-muted'
                    }`} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Chat Demo */}
            <Card className="p-6 h-96 flex flex-col">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="h-8 w-8 rounded-full bg-crm-primary flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">{demos[currentDemo].title}</h4>
                  <p className="text-xs text-muted-foreground">Online now</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {displayedMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        message.sender === 'bot'
                          ? 'bg-muted text-foreground'
                          : message.isResult
                          ? 'bg-green-500 text-white'
                          : 'bg-crm-primary text-white'
                      } ${message.isResult ? 'font-semibold' : ''}`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Sales Automation Platform
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to manage, deploy, and optimize AI sales agents
            </p>
          </div>

          <Tabs defaultValue="agents" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="agents">AI Agent Management</TabsTrigger>
              <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="agents" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Create Custom AI Sales Agents</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Custom Personalities</p>
                        <p className="text-sm text-muted-foreground">Train agents with your brand voice and sales approach</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Product Knowledge</p>
                        <p className="text-sm text-muted-foreground">Upload catalogs and train on your specific offerings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Multi-Channel Deployment</p>
                        <p className="text-sm text-muted-foreground">Deploy on website, WhatsApp, SMS, and email</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Card className="p-6 bg-gradient-to-br from-crm-primary/5 to-crm-secondary/5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-crm-primary flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Sales Agent: Sarah</p>
                        <p className="text-sm text-muted-foreground">E-commerce Specialist</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Status: <span className="text-green-500 font-medium">Active</span> • 
                      Conversations: <span className="font-medium">847 today</span> •
                      Conversion: <span className="font-medium">23%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="pipeline" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <Card className="p-6">
                  <h4 className="font-semibold mb-4">Live Pipeline Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Leads</span>
                      <Badge variant="secondary">142</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Qualified</span>
                      <Badge variant="secondary">89</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Negotiation</span>
                      <Badge variant="secondary">34</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Closed Won</span>
                      <Badge className="bg-green-500">67</Badge>
                    </div>
                  </div>
                </Card>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Visual Sales Pipeline</h3>
                  <p className="text-muted-foreground mb-4">
                    Track every lead from first contact to closed deal. AI agents automatically 
                    update lead status and schedule follow-ups.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Automatic lead scoring and qualification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Real-time pipeline updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Intelligent follow-up scheduling</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Deep Conversation Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Get insights into every customer interaction. Understand what works, 
                    optimize agent performance, and improve conversion rates.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-crm-primary">340%</div>
                      <div className="text-xs text-muted-foreground">Conversion Increase</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-crm-secondary">24/7</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                  </div>
                </div>
                <Card className="p-6 space-y-4">
                  <h4 className="font-semibold">Today's Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conversations</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Qualified Leads</span>
                      <span className="font-medium">312</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="font-medium text-green-500">25.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue Generated</span>
                      <span className="font-medium text-crm-primary">$89,400</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to 10x Your Sales with AI?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join 500+ businesses already using AI sales agents to automate their sales process 
            and increase revenue. Setup takes less than 5 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              className="bg-crm-primary hover:bg-crm-primary/90"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial - No Credit Card
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
            >
              Book a Demo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Free 14-day trial • Cancel anytime • Setup in 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
