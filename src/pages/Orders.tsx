import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OrderTable from '@/components/OrderTable';
import { API_CONFIG } from '@/config/api';
import axios from 'axios';

export interface OrderDetail {
  order_detail_id?: number;
  order_id?: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface Order {
  order_id?: number;
  phone_number: number;
  order_date: string;
  status: string;
  order_details: OrderDetail[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Order>({
    phone_number: 0,
    order_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    order_details: [{ product_id: 0, quantity: 1, unit_price: 0 }]
  });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("GET /orders response.data:", response.data); // <- add this
      setOrders(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');

      // prepare payload with total_price for each detail and total_amount for order
      const detailsWithTotals = formData.order_details.map(d => {
        const quantity = Number(d.quantity) || 0;
        const unit_price = Number(d.unit_price) || 0;
        return {
          ...d,
          quantity,
          unit_price,
          total_price: parseFloat((quantity * unit_price).toFixed(2)),
        };
      });

      const total_amount = parseFloat(
        detailsWithTotals.reduce((sum, d) => sum + (d.total_price ?? 0), 0).toFixed(2)
      );

      const payload = {
        ...formData,
        order_details: detailsWithTotals,
        total_amount,
      };

      await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Success",
        description: "Order created successfully",
      });

      setDialogOpen(false);
      resetForm();
      fetchOrders();
    } catch (error: any) {
      // show server validation error in console to debug
      console.error('Create order error:', error.response?.data ?? error);
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      phone_number: 0,
      order_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      order_details: [{ product_id: 0, quantity: 1, unit_price: 0 }]
    });
  };

  const addOrderDetail = () => {
    setFormData({
      ...formData,
      order_details: [...formData.order_details, { product_id: 0, quantity: 1, unit_price: 0 }]
    });
  };

  const removeOrderDetail = (index: number) => {
    const newDetails = formData.order_details.filter((_, i) => i !== index);
    setFormData({ ...formData, order_details: newDetails });
  };

  const updateOrderDetail = (index: number, field: keyof OrderDetail, value: number) => {
    const newDetails = [...formData.order_details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData({ ...formData, order_details: newDetails });
  };

  return (
    <div className="crm-container">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    type="number"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({ ...formData, phone_number: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order_date">Order Date</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label>Order Details</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOrderDetail}>
                    Add Item
                  </Button>
                </div>
                
                {formData.order_details.map((detail, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 mb-3 p-3 border rounded">
                    <div>
                      <Label>Product</Label>
                      <Select 
                        value={detail.product_id.toString()} 
                        onValueChange={(value) => updateOrderDetail(index, 'product_id', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.product_id} value={product.product_id.toString()}>
                              {product.product_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={detail.quantity}
                        onChange={(e) => updateOrderDetail(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={detail.unit_price}
                        onChange={(e) => updateOrderDetail(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeOrderDetail(index)}
                        disabled={formData.order_details.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Order</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <OrderTable 
        orders={orders} 
        loading={loading} 
        onRefresh={fetchOrders}
        products={products}
      />
    </div>
  );
};

export default Orders;