
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

const Login = () => {
  const [tenantName, setTenantName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', tenantName);
      formData.append('password', password);

      const response = await axios.post(getApiUrl('TOKEN'), formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const { access_token, token_type } = response.data;
      
      // Store the token (you might want to use localStorage or a proper auth context)
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('token_type', token_type);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${tenantName}!`,
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.detail || "Invalid tenant name or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-2">
          <CardHeader className="space-y-1 text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-crm-primary to-crm-secondary text-transparent bg-clip-text mb-2" onClick={() => navigate("/")}>
              Valvia
            </div>
            <CardTitle className="text-2xl font-bold">AI Sales CRM</CardTitle>
            <CardDescription className="text-md">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant Name</Label>
                <Input 
                  id="tenant" 
                  placeholder="your-tenant-name" 
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
