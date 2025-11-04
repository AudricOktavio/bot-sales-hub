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
import orderScreenshot from '@/assets/screenshot-order-management.png';
import dashboardScreenshot from '@/assets/screenshot-dashboard.png';
import productsScreenshot from '@/assets/screenshot-products.png';
import odooLogo from '@/assets/odoo-logo.svg';
import sapLogo from '@/assets/sap-logo.svg';
import { AnimatedGridBackground } from '@/components/AnimatedGridBackground';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden">
      {/* Enhanced Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center relative z-50">
        <div className="text-2xl font-bold text-white">
          Valvia
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href}
              className="text-slate-300 hover:text-white transition-colors"
            >
              {item.name}
            </a>
          ))}
          <div className="flex items-center space-x-2 ml-4">
            <Button 
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-white hover:bg-white/10"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Sign Up
            </Button>
          </div>
        </div>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm" className="text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </nav>

      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        {/* Animated Grid Background - spans both hero and screenshots */}
        <div className="absolute inset-0 w-full h-full">
          <AnimatedGridBackground />
        </div>
        
        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-12 pb-32 relative">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-full text-primary font-medium text-sm border border-primary/30">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Agentic AI</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-white">Your </span>
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                CRM Revolution
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-2xl">
              Valvia transforms customer relationships with autonomous AI agents that work 24/7, 
              making every interaction intelligent, personalized, and effortless.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6 shadow-2xl shadow-primary/50"
                onClick={() => navigate('/signup')}
              >
                Start Free Trial <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 bg-white/5 text-white hover:bg-white/15 text-lg px-8 py-6 backdrop-blur-sm"
                onClick={() => navigate('/login')}
              >
                Watch Demo <Play className="ml-2" />
              </Button>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  10x
                </div>
                <div className="text-sm text-slate-400">Faster Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent mb-2">
                  99%
                </div>
                <div className="text-sm text-slate-400">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <div className="text-sm text-slate-400">AI Availability</div>
              </div>
            </div>
          </div>

          {/* Right Column - Floating Phone */}
          <div className="relative h-[600px] flex items-center justify-center lg:justify-end">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
            <img 
              src={phoneImage} 
              alt="AI Sales Platform" 
              className="relative z-10 max-h-full w-auto object-contain animate-float-tilt drop-shadow-2xl"
              style={{ transform: 'rotate(-5deg)' }}
            />
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section className="container mx-auto px-4 pb-32 relative z-10">
        <div className="relative">
          {/* Integration Badges - Floating around screenshots */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Left Badge */}
            <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center animate-orbit-slow z-20">
              <img src={odooLogo} alt="Odoo" className="w-10 h-10 object-contain" />
            </div>
            {/* Top Right Badge */}
            <div className="absolute top-0 right-1/4 translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center animate-orbit-reverse z-20">
              <img src={sapLogo} alt="SAP" className="w-10 h-10 object-contain" />
            </div>
            {/* Bottom Left Badge */}
            <div className="absolute bottom-0 left-1/3 -translate-x-1/2 translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center animate-orbit-slow border-2 border-primary/20 z-20">
              <Database className="w-7 h-7 text-primary" />
            </div>
            {/* Bottom Right Badge */}
            <div className="absolute bottom-0 right-1/3 translate-x-1/2 translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center animate-orbit-reverse border-2 border-secondary/20 z-20">
              <Zap className="w-7 h-7 text-secondary" />
            </div>
            {/* Dotted connection lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
              <line x1="25%" y1="0%" x2="33%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="75%" y1="0%" x2="66%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
          </div>

          {/* Screenshot Frames */}
          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            {/* Frame 1 - Order Management */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 border border-white/10 shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-2">
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={orderScreenshot} 
                    alt="Order Management" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-semibold">Automated Order Management</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Frame 2 - Dashboard */}
            <div className="group relative md:mt-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-accent rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 border border-white/10 shadow-2xl hover:shadow-secondary/30 transition-all duration-300 hover:-translate-y-2">
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={dashboardScreenshot} 
                    alt="CRM Analytics" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-semibold">Data-Driven Insights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Frame 3 - Products */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-3 border border-white/10 shadow-2xl hover:shadow-accent/30 transition-all duration-300 hover:-translate-y-2">
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={productsScreenshot} 
                    alt="Product Knowledge" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-semibold">Intelligent Product Integration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      </div>
      {/* End of Hero + Screenshots wrapper with animated background */}

      {/* Rest of content with restored background */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-12">
        
        {/* Interactive Demo Section */}
        <section id="use-cases" className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              See AI Sales Agents in Action
            </h2>
            <p className="text-slate-300 text-lg">
              Watch real conversations and see how AI agents convert leads across different industries
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Demo Selector */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4 text-white">Choose a Demo:</h3>
              {demos.map((demo, index) => (
                <Card 
                  key={index}
                  className={`p-4 cursor-pointer transition-all border hover:shadow-xl ${
                    currentDemo === index 
                      ? 'border-primary bg-slate-800/70 backdrop-blur-sm shadow-primary/30' 
                      : 'border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-primary/50'
                  }`}
                  onClick={() => setCurrentDemo(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{demo.title}</h4>
                      <p className="text-sm text-slate-400">{demo.industry}</p>
                    </div>
                    <div className={`h-3 w-3 rounded-full transition-colors ${
                      currentDemo === index ? 'bg-primary' : 'bg-slate-600'
                    }`} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Chat Demo */}
            <Card className="p-6 h-96 flex flex-col bg-slate-800/70 backdrop-blur-sm border-white/10">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{demos[currentDemo].title}</h4>
                  <p className="text-xs text-slate-400">Online now</p>
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
                          ? 'bg-slate-700/50 text-white'
                          : message.isResult
                          ? 'bg-green-500 text-white'
                          : 'bg-gradient-to-r from-primary to-secondary text-white'
                      } ${message.isResult ? 'font-semibold' : ''}`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700/50 rounded-xl p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Streamline Every Step of Your Sales Process from Inquiry to Closing
            </h2>
            <p className="text-slate-300 text-lg">
              See how Valvia processes customer requests and generates intelligent responses
            </p>
          </div>

          <Card className="p-8 bg-slate-800/50 backdrop-blur-sm border-white/10">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
              {workflowSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex flex-col items-center transition-all duration-500 ${
                    activeStep === index ? 'scale-110' : 'scale-100'
                  }`}>
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                      activeStep === index 
                        ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30' 
                        : 'bg-slate-700/50 text-slate-400'
                    }`}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <p className={`text-sm font-medium text-center max-w-20 transition-colors duration-500 ${
                      activeStep === index ? 'text-primary' : 'text-slate-400'
                    }`}>
                      {step.step}
                    </p>
                    <p className="text-xs text-slate-500 text-center max-w-24 mt-1">
                      {step.description}
                    </p>
                  </div>
                  
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className={`h-6 w-6 mx-2 transition-colors duration-500 ${
                      activeStep === index ? 'text-primary' : 'text-slate-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* AI Capabilities Showcase */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-6 bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">
              <Bot className="h-3 w-3 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Smart AI That Handles Everything
            </h2>
            <p className="text-slate-300 text-lg">
              From customer inquiries to closed deals - your AI agent manages it all
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Phone Image */}
            <div className="relative flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl" />
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
              <Card className="p-6 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 border border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-primary/50">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white">Order Management</h3>
                    <p className="text-slate-400 mb-3">
                      AI agents automatically process orders, check inventory in real-time, 
                      generate invoices, and update order status across your entire system.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Real-time Inventory
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Auto Invoicing
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Order Tracking
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Data-Driven Decisions */}
              <Card className="p-6 hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 border border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-accent/50">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/30">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white">Data-Driven Decisions</h3>
                    <p className="text-slate-400 mb-3">
                      Access comprehensive analytics and insights to make informed business decisions. 
                      Track performance, conversion rates, and revenue in real-time.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Live Analytics
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Performance Reports
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                        <Star className="h-3 w-3 mr-1" />
                        Lead Scoring
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Product Knowledge */}
              <Card className="p-6 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 border border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-secondary/50">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center flex-shrink-0 shadow-lg shadow-secondary/30">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-white">Product Knowledge Integration</h3>
                    <p className="text-slate-400 mb-3">
                      AI agents have instant access to your complete product catalog, pricing, 
                      and stock levels through direct integration with SAP, Odoo, or your WMS.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                        <Database className="h-3 w-3 mr-1" />
                        SAP Integration
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                        <Database className="h-3 w-3 mr-1" />
                        Odoo Sync
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
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
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Complete Sales Automation Platform
            </h2>
            <p className="text-slate-300 text-lg">
              Everything you need to manage, deploy, and optimize AI sales agents
            </p>
          </div>

          <Tabs defaultValue="agents" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800/50 backdrop-blur-sm border-white/10">
              <TabsTrigger value="agents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white text-slate-400">AI Agent Management</TabsTrigger>
              <TabsTrigger value="pipeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white text-slate-400">Sales Pipeline</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white text-slate-400">Analytics & Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="agents" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Create Custom AI Sales Agents</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Custom Personalities</p>
                        <p className="text-sm text-slate-400">Train agents with your brand voice and sales approach</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Product Knowledge</p>
                        <p className="text-sm text-slate-400">Upload catalogs and train on your specific offerings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-white">Multi-Channel Deployment</p>
                        <p className="text-sm text-slate-400">Deploy on website, WhatsApp, SMS, and email</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-white/10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">Sales Agent: Sarah</p>
                        <p className="text-sm text-slate-400">E-commerce Specialist</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">
                      Status: <span className="text-green-400 font-medium">Active</span> • 
                      Conversations: <span className="font-medium text-white">847 today</span> •
                      Conversion: <span className="font-medium text-white">23%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="pipeline" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-white/10">
                  <h4 className="font-semibold mb-4 text-white">Live Pipeline Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">New Leads</span>
                      <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600">142</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Qualified</span>
                      <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600">89</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">In Negotiation</span>
                      <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600">34</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Closed Won</span>
                      <Badge className="bg-green-500 text-white">67</Badge>
                    </div>
                  </div>
                </Card>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Visual Sales Pipeline</h3>
                  <p className="text-slate-400 mb-4">
                    Track every lead from first contact to closed deal. AI agents automatically 
                    update lead status and schedule follow-ups.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-slate-300">Automatic lead scoring and qualification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-slate-300">Real-time pipeline updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-slate-300">Intelligent follow-up scheduling</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Deep Conversation Analytics</h3>
                  <p className="text-slate-400 mb-4">
                    Get insights into every customer interaction. Understand what works, 
                    optimize agent performance, and improve conversion rates.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-white/10">
                      <div className="text-2xl font-bold text-primary">340%</div>
                      <div className="text-xs text-slate-500">Conversion Increase</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-white/10">
                      <div className="text-2xl font-bold text-accent">24/7</div>
                      <div className="text-xs text-slate-500">Available</div>
                    </div>
                  </div>
                </div>
                <Card className="p-6 space-y-4 bg-slate-800/50 backdrop-blur-sm border-white/10">
                  <h4 className="font-semibold text-white">Today's Performance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Conversations</span>
                      <span className="font-medium text-white">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Qualified Leads</span>
                      <span className="font-medium text-white">312</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Conversion Rate</span>
                      <span className="font-medium text-green-400">25.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Revenue Generated</span>
                      <span className="font-medium text-primary">$89,400</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Easy Integrations Section */}
        <section id="integrations" className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Easy Integrations
            </h2>
            <p className="text-slate-300 text-lg">
              Unify Your Customer Relationship Management Systems and Data. Safely.
            </p>
          </div>

          <div className="relative">
            {/* Central CRM Hub */}
            <div className="flex justify-center mb-8">
              <Card className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 backdrop-blur-sm">
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-white">Valvia AI Agent</h3>
                  <p className="text-sm text-slate-400">Central Intelligence Hub</p>
                </div>
              </Card>
            </div>

            {/* Integration Icons with connecting lines */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
              {integrations.map((integration, index) => (
                <div key={integration.name} className="relative">
                  {/* Connecting line to center */}
                  <div className={`absolute top-6 left-1/2 w-px h-20 bg-gradient-to-t from-primary/30 to-transparent transform -translate-x-1/2 -translate-y-full animate-pulse`} 
                       style={{ animationDelay: `${integration.delay}ms` }} />
                  
                  <Card 
                    className="p-4 text-center hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 group relative z-10 bg-slate-800/50 backdrop-blur-sm border-white/10"
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
                    <p className="text-sm font-medium text-white">{integration.name}</p>
                    <div className="mt-2 h-1 w-full bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out"
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
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Flexible pricing that scales with your business needs
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-1 mb-8">
              <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-secondary text-white rounded-md shadow-sm transition-all">
                Monthly
              </button>
              <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-all">
                Annual
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Mobile: Stack cards vertically */}
          <div className="block lg:hidden space-y-6">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative p-6 bg-slate-800/50 backdrop-blur-sm border ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-xl shadow-primary/20' 
                    : 'border-white/10'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-4 bg-gradient-to-r from-primary to-secondary text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">Rp {plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white' 
                      : 'bg-white/5 border-white/30 text-white hover:bg-white/15'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>

                <div className="space-y-4">
                  <div className="text-center py-3 px-4 bg-slate-700/30 backdrop-blur-sm rounded-lg border border-white/10">
                    <span className="font-semibold text-white">{plan.responses} responses</span>
                    <span className="text-slate-400 text-sm block">per month</span>
                  </div>
                  
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Channels</span>
                      <span className="text-sm font-medium text-white">{plan.channels}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Integration</span>
                      <span className="text-sm font-medium text-white">{plan.integration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Agents</span>
                      <span className="text-sm font-medium text-white">{plan.seats}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Support</span>
                      <span className="text-sm font-medium text-white">{plan.support}</span>
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
                className={`relative p-6 flex flex-col h-full bg-slate-800/50 backdrop-blur-sm border ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-xl shadow-primary/20 scale-105 z-10' 
                    : 'border-white/10'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">Rp {plan.price}</span>
                    <span className="text-slate-400 text-sm block">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6 flex-grow">
                  <div className="text-center py-2 px-3 bg-slate-700/30 backdrop-blur-sm rounded-lg border border-white/10">
                    <span className="text-sm font-medium text-white">{plan.responses} responses/month</span>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mb-6 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Channels:</span>
                    <span className="font-medium text-white">{plan.channels}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Integration:</span>
                    <span className="font-medium text-white">{plan.integration}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Agents:</span>
                    <span className="font-medium text-white">{plan.seats}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Support:</span>
                    <span className="font-medium text-white">{plan.support}</span>
                  </div>
                </div>

                <Button 
                  className={`w-full mt-auto ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white' 
                      : 'bg-white/5 border-white/30 text-white hover:bg-white/15'
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
        <div className="text-center max-w-2xl mx-auto pb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your CRM?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join thousands of teams already using Valvia to automate customer relationships and drive unprecedented growth with AI-powered intelligence.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 bg-white/5 text-white hover:bg-white/15 text-lg px-8 py-6 backdrop-blur-sm"
            >
              Talk to Sales
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text mb-4">
                Valvia
              </div>
              <p className="text-slate-400 mb-4">
                PT PORTA OKULER TEKNOLOGI
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-primary transition-colors">
...
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="text-slate-400 hover:text-white transition-colors">Integration</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://wa.me/6281234567890" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Contact</h3>
              <div className="text-slate-400 text-sm">
                <p>PT PORTA OKULER TEKNOLOGI</p>
                <p>Jakarta, Indonesia</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-slate-500 text-sm">
            <p>&copy; 2025 Valvia by PT PORTA OKULER TEKNOLOGI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;