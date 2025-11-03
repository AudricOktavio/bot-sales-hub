import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle,
  Globe,
  Database,
  Cloud,
  Smartphone,
  CreditCard,
  FileText,
  Settings,
  Workflow,
  Brain,
  Shield,
  HeadphonesIcon,
  ArrowRight,
  Zap,
  BarChart3,
  Star,
  Bot,
  Sparkles
} from 'lucide-react';
import phoneImage from '@/assets/phone-illustration.png';

const Index = () => {
  const navigate = useNavigate();
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [activeStep, setActiveStep] = useState(0);

  // Enhanced navbar items
  const navItems = [
    { name: 'Use Cases', href: '#use-cases' },
    { name: 'Features', href: '#features' },
    { name: 'Integration', href: '#integrations' },
    { name: 'Pricing', href: '#pricing' }
  ];

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

  // Integration logos and data with actual image sources
  const integrations = [
    { name: 'SAP', imageSrc: '/lovable-uploads/c2d3129c-b7e5-4219-ac07-af0019719125.png', delay: 0 },
    { name: 'Odoo', icon: Settings, color: 'text-purple-600', delay: 200 },
    { name: 'Midtrans', imageSrc: '/lovable-uploads/17134334-27db-490e-b585-8c7a003ceee5.png', delay: 400 },
    { name: 'WhatsApp', imageSrc: '/lovable-uploads/e3a2e55e-12f2-448e-80ad-1ebd4004b319.png', delay: 600 },
    { name: 'OneDrive', imageSrc: '/lovable-uploads/15679a59-be93-4738-8864-7e495dcb4d23.png', delay: 800 },
    { name: 'Google Drive', imageSrc: '/lovable-uploads/23159d50-feaa-4804-a06a-57daed92fc25.png', delay: 1000 }
  ];

  // AI Workflow steps
  const workflowSteps = [
    { step: "Customer Inquiry", icon: MessageCircle, description: "Customer reaches out via any channel" },
    { step: "AI Processing", icon: Brain, description: "AI analyzes intent and context" },
    { step: "CRM Query", icon: Database, description: "Checks SAP/Odoo for inventory & pricing" },
    { step: "Response Generation", icon: Zap, description: "Crafts personalized response" },
    { step: "Payment Link", icon: CreditCard, description: "Generates secure Midtrans payment" }
  ];

  // Pricing plans
  const pricingPlans = [
    {
      name: 'Pro',
      description: 'Perfect for small businesses getting started',
      price: '1,799K',
      period: '/month',
      responses: '15,000',
      channels: 'WhatsApp, Messenger',
      integration: 'Basic CRM',
      seats: '1 Agent',
      reports: 'Basic Analytics',
      support: 'Email Support',
      popular: false,
      features: ['AI Chat Bot', 'Basic Analytics', 'WhatsApp Integration', 'Email Support']
    },
    {
      name: 'Business',
      description: 'Most popular for growing teams',
      price: '3,599K',
      period: '/month',
      responses: '50,000',
      channels: 'Multi-Channel',
      integration: 'SAP + Odoo',
      seats: '3 Agents',
      reports: 'Weekly Reports',
      support: 'Priority Support',
      popular: true,
      features: ['Everything in Pro', 'SAP Integration', 'Multi-Channel', 'Weekly Reports', 'Priority Support']
    },
    {
      name: 'Enterprise',
      description: 'Advanced features for large organizations',
      price: '5,599K',
      period: '/month',
      responses: '150,000',
      channels: 'All Channels',
      integration: 'Full CRM Suite',
      seats: '10 Agents',
      reports: 'Advanced Analytics',
      support: 'Dedicated Manager',
      popular: false,
      features: ['Everything in Business', 'Advanced Analytics', 'API Access', 'Custom Integrations', 'Dedicated Manager']
    },
    {
      name: 'Unlimited',
      description: 'Complete white-label solution',
      price: '15,599K',
      period: '/month',
      responses: 'Unlimited',
      channels: 'Custom Channels',
      integration: 'Enterprise Suite',
      seats: 'Unlimited',
      reports: 'Custom Dashboards',
      support: 'White-label Support',
      popular: false,
      features: ['Everything in Enterprise', 'Unlimited Usage', 'White-label Solution', 'Custom Development', '24/7 Phone Support']
    }
  ];

  // Agent personality options
  const agentTones = [
    { name: 'Professional', description: 'Formal, business-focused approach', sample: 'Good day! I\'d be happy to assist you with finding the perfect solution for your business needs.' },
    { name: 'Friendly', description: 'Warm, conversational tone', sample: 'Hey there! 😊 I\'m excited to help you find exactly what you\'re looking for today!' },
    { name: 'Empathetic', description: 'Understanding, caring approach', sample: 'I understand this might be a big decision for you. Let me help guide you through the options at your own pace.' }
  ];

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

  // Auto-cycle through workflow steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Increase in Sales", value: "340%", icon: TrendingUp },
    { label: "Response Time", value: "<30s", icon: Clock },
    { label: "Customer Satisfaction", value: "94%", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Enhanced Navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-crm-primary to-crm-secondary text-transparent bg-clip-text">
          Valvia
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </a>
          ))}
          <div className="flex items-center space-x-2 ml-4">
            <Button 
              variant="ghost"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-crm-primary hover:bg-crm-primary/90"
            >
              Sign Up
            </Button>
          </div>
        </div>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 bg-crm-primary/10 text-crm-primary hover:bg-crm-primary/20">
            Valvia - AI That Closes Deals
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-crm-primary to-crm-secondary text-transparent bg-clip-text animate-fade-in">
            AI That Closes Deals — and Opens Up Your Time.
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
        <section id="use-cases" className="max-w-6xl mx-auto mb-20">
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
        </section>

        {/* Under the Hood: AI Logic Preview */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Streamline Every Step of Your Sales Process from Inquiry to Closing
            </h2>
            <p className="text-muted-foreground text-lg">
              See how Valvia processes customer requests and generates intelligent responses
            </p>
          </div>

          <Card className="p-8 bg-gradient-to-br from-background to-muted/50">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
              {workflowSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex flex-col items-center transition-all duration-500 ${
                    activeStep === index ? 'scale-110' : 'scale-100'
                  }`}>
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                      activeStep === index 
                        ? 'bg-crm-primary text-white shadow-lg shadow-crm-primary/30' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <p className={`text-sm font-medium text-center max-w-20 transition-colors duration-500 ${
                      activeStep === index ? 'text-crm-primary' : 'text-muted-foreground'
                    }`}>
                      {step.step}
                    </p>
                    <p className="text-xs text-muted-foreground text-center max-w-24 mt-1">
                      {step.description}
                    </p>
                  </div>
                  
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className={`h-6 w-6 mx-2 transition-colors duration-500 ${
                      activeStep === index ? 'text-crm-primary' : 'text-muted-foreground'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* AI Capabilities Showcase */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-6 bg-crm-primary/10 text-crm-primary hover:bg-crm-primary/20">
              <Bot className="h-3 w-3 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Smart AI That Handles Everything
            </h2>
            <p className="text-muted-foreground text-lg">
              From customer inquiries to closed deals - your AI agent manages it all
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Phone Image */}
            <div className="relative flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-crm-primary/20 to-crm-secondary/20 rounded-full blur-3xl" />
                <img 
                  src={phoneImage}
                  alt="AI Sales Communication"
                  className="relative h-96 w-auto object-contain animate-float"
                />
              </div>
            </div>

            {/* Capabilities List */}
            <div className="space-y-8">
              {/* Order Management */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-crm-primary/50">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-crm-primary to-crm-primary/70 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Order Management</h3>
                    <p className="text-muted-foreground mb-3">
                      AI agents automatically process orders, check inventory in real-time, 
                      generate invoices, and update order status across your entire system.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Real-time Inventory
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Auto Invoicing
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Order Tracking
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Data-Driven Decisions */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-crm-primary/50">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-crm-secondary to-crm-secondary/70 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Data-Driven Decisions</h3>
                    <p className="text-muted-foreground mb-3">
                      Access comprehensive analytics and insights to make informed business decisions. 
                      Track performance, conversion rates, and revenue in real-time.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Live Analytics
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Performance Reports
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Lead Scoring
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Product Knowledge */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-crm-primary/50">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Product Knowledge Integration</h3>
                    <p className="text-muted-foreground mb-3">
                      AI agents have instant access to your complete product catalog, pricing, 
                      and stock levels through direct integration with SAP, Odoo, or your WMS.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Database className="h-3 w-3 mr-1" />
                        SAP Integration
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Database className="h-3 w-3 mr-1" />
                        Odoo Sync
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Workflow className="h-3 w-3 mr-1" />
                        Live Stock Updates
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section id="features" className="max-w-6xl mx-auto mb-20">
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
        </section>

        {/* Easy Integrations Section */}
        <section id="integrations" className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Easy Integrations
            </h2>
            <p className="text-muted-foreground text-lg">
              Unify Your Customer Relationship Management Systems and Data. Safely.
            </p>
          </div>

          <div className="relative">
            {/* Central CRM Hub */}
            <div className="flex justify-center mb-8">
              <Card className="p-6 bg-gradient-to-br from-crm-primary/10 to-crm-secondary/10 border-2 border-crm-primary/20">
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-crm-primary flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Valvia AI Agent</h3>
                  <p className="text-sm text-muted-foreground">Central Intelligence Hub</p>
                </div>
              </Card>
            </div>

            {/* Integration Icons with connecting lines */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
              {integrations.map((integration, index) => (
                <div key={integration.name} className="relative">
                  {/* Connecting line to center */}
                  <div className={`absolute top-6 left-1/2 w-px h-20 bg-gradient-to-t from-crm-primary/30 to-transparent transform -translate-x-1/2 -translate-y-full animate-pulse`} 
                       style={{ animationDelay: `${integration.delay}ms` }} />
                  
                  <Card 
                    className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 group relative z-10"
                    style={{ animationDelay: `${integration.delay}ms` }}
                  >
                    <div className="h-12 w-12 mx-auto mb-3 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
                      {integration.imageSrc ? (
                        <img 
                          src={integration.imageSrc} 
                          alt={integration.name}
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <integration.icon className={`h-6 w-6 ${integration.color}`} />
                      )}
                    </div>
                    <p className="text-sm font-medium">{integration.name}</p>
                    <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-crm-primary rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: '100%',
                          animationDelay: `${integration.delay + 500}ms`
                        }}
                      />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-6xl mx-auto mb-20 px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Flexible pricing that scales with your business needs
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-muted rounded-lg p-1 mb-8">
              <button className="px-4 py-2 text-sm font-medium bg-background text-foreground rounded-md shadow-sm transition-all">
                Monthly
              </button>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
                Annual
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Mobile: Stack cards vertically */}
          <div className="block lg:hidden space-y-6">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative p-6 ${
                  plan.popular 
                    ? 'border-2 border-crm-primary bg-crm-primary/5 shadow-lg' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-4 bg-crm-primary text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">Rp {plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-crm-primary hover:bg-crm-primary/90 text-white' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>

                <div className="space-y-4">
                  <div className="text-center py-3 px-4 bg-muted/50 rounded-lg">
                    <span className="font-semibold">{plan.responses} responses</span>
                    <span className="text-muted-foreground text-sm block">per month</span>
                  </div>
                  
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Channels</span>
                      <span className="text-sm font-medium">{plan.channels}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Integration</span>
                      <span className="text-sm font-medium">{plan.integration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Agents</span>
                      <span className="text-sm font-medium">{plan.seats}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Support</span>
                      <span className="text-sm font-medium">{plan.support}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative p-6 flex flex-col h-full ${
                  plan.popular 
                    ? 'border-2 border-crm-primary bg-crm-primary/5 shadow-lg scale-105 z-10' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-crm-primary text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">Rp {plan.price}</span>
                    <span className="text-muted-foreground text-sm block">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6 flex-grow">
                  <div className="text-center py-2 px-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">{plan.responses} responses/month</span>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mb-6 pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Channels:</span>
                    <span className="font-medium">{plan.channels}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Integration:</span>
                    <span className="font-medium">{plan.integration}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Agents:</span>
                    <span className="font-medium">{plan.seats}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Support:</span>
                    <span className="font-medium">{plan.support}</span>
                  </div>
                </div>

                <Button 
                  className={`w-full mt-auto ${
                    plan.popular 
                      ? 'bg-crm-primary hover:bg-crm-primary/90 text-white' 
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Sales?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of businesses using Valvia AI to close more deals and save time.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-crm-primary hover:bg-crm-primary/90"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="text-2xl font-bold bg-gradient-to-r from-crm-primary to-crm-secondary text-transparent bg-clip-text mb-4">
                Valvia AI CRM
              </div>
              <p className="text-muted-foreground mb-4">
                PT PORTA OKULER TEKNOLOGI
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-crm-primary transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.758-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.99C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-crm-primary transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-crm-primary transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="text-muted-foreground hover:text-foreground transition-colors">Integration</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://wa.me/6281234567890" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="text-muted-foreground text-sm">
                <p>PT PORTA OKULER TEKNOLOGI</p>
                <p>Jakarta, Indonesia</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Valvia AI CRM by PT PORTA OKULER TEKNOLOGI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;