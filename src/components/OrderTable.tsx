import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_CONFIG } from '@/config/api';
import axios from 'axios';
import { Order, OrderDetail } from '@/pages/Orders';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  products: any[];
}

const OrderTable = ({ orders, loading, onRefresh, products }: OrderTableProps) => {
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'default' as const,
      processing: 'secondary' as const,
      shipped: 'outline' as const,
      delivered: 'default' as const,
      cancelled: 'destructive' as const
    };
    return <Badge variant={statusColors[status as keyof typeof statusColors] || 'default'}>{status}</Badge>;
  };

  const getProductName = (productId: number) => {
    const product = products.find(p => p.product_id === productId);
    return product ? product.product_name : `Product ${productId}`;
  };

  const calculateOrderTotal = (orderDetails: OrderDetail[]) => {
    return orderDetails.reduce((total, detail) => total + (detail.quantity * detail.unit_price), 0);
  };

  const handleEdit = (order: Order) => {
    setEditingOrder({ ...order });
    setEditDialogOpen(true);
  };

  const handleView = (order: Order) => {
    setViewingOrder(order);
    setViewDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder?.order_id) return;

    try {
      const token = localStorage.getItem('access_token');
      const { order_id, ...updateData } = editingOrder;
      
      await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_BY_ID(order_id)}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Success",
        description: "Order updated successfully",
      });

      setEditDialogOpen(false);
      setEditingOrder(null);
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_BY_ID(orderId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Success",
        description: "Order deleted successfully",
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const updateOrderDetail = (index: number, field: keyof OrderDetail, value: number) => {
    if (!editingOrder) return;
    
    const newDetails = [...editingOrder.order_details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setEditingOrder({ ...editingOrder, order_details: newDetails });
  };

  const addOrderDetail = () => {
    if (!editingOrder) return;
    
    setEditingOrder({
      ...editingOrder,
      order_details: [...editingOrder.order_details, { product_id: 0, quantity: 1, unit_price: 0 }]
    });
  };

  const removeOrderDetail = (index: number) => {
    if (!editingOrder) return;
    
    const newDetails = editingOrder.order_details.filter((_, i) => i !== index);
    setEditingOrder({ ...editingOrder, order_details: newDetails });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items Count</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell>#{order.order_id}</TableCell>
                  <TableCell>{order.phone_number}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.order_details.length}</TableCell>
                  <TableCell>${calculateOrderTotal(order.order_details).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(order)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteOrder(order.order_id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{viewingOrder?.order_id}</DialogTitle>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <p className="font-medium">{viewingOrder.phone_number}</p>
                </div>
                <div>
                  <Label>Order Date</Label>
                  <p className="font-medium">{new Date(viewingOrder.order_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(viewingOrder.status)}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-lg">Order Items</Label>
                <div className="mt-2 space-y-2">
                  {viewingOrder.order_details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{getProductName(detail.product_id)}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {detail.quantity} × ${detail.unit_price}
                          </p>
                        </div>
                      </div>
                      <div className="font-medium">
                        ${(detail.quantity * detail.unit_price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-muted rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold">
                      ${calculateOrderTotal(viewingOrder.order_details).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order - #{editingOrder?.order_id}</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_phone_number">Phone Number</Label>
                  <Input
                    id="edit_phone_number"
                    type="number"
                    value={editingOrder.phone_number}
                    onChange={(e) => setEditingOrder({ 
                      ...editingOrder, 
                      phone_number: parseInt(e.target.value) || 0 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_order_date">Order Date</Label>
                  <Input
                    id="edit_order_date"
                    type="date"
                    value={editingOrder.order_date}
                    onChange={(e) => setEditingOrder({ 
                      ...editingOrder, 
                      order_date: e.target.value 
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select 
                  value={editingOrder.status} 
                  onValueChange={(value) => setEditingOrder({ ...editingOrder, status: value })}
                >
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
                
                {editingOrder.order_details.map((detail, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 mb-3 p-3 border rounded">
                    <div>
                      <Label>Product</Label>
                      <Select 
                        value={detail.product_id.toString()} 
                        onValueChange={(value) => updateOrderDetail(index, 'product_id', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                        disabled={editingOrder.order_details.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateOrder}>Update Order</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderTable;