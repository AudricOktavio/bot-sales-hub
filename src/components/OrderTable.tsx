import React, { useState } from 'react';
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
import { Order as OrderType, OrderDetail as OrderDetailType } from '@/pages/Orders';

interface OrderTableProps {
  orders: OrderType[];
  loading: boolean;
  onRefresh: () => void;
  products: any[];
}

export default function OrderTable({ orders, loading, onRefresh, products }: OrderTableProps) {
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const [viewingOrder, setViewingOrder] = useState<OrderType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const { toast } = useToast();

  const getStatusBadge = (status?: string) => {
    const statusColors: Record<string, any> = {
      pending: 'default',
      processing: 'secondary',
      shipped: 'outline',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={statusColors[status ?? 'pending'] || 'default'}>{status}</Badge>;
  };

  const getProductName = (productId?: number) => {
    if (productId === undefined || productId === null) return `Product ${productId}`;
    const product = products.find((p) => p.product_id === Number(productId));
    return product ? product.product_name : `Product ${productId}`;
  };

  const formatCurrency = (value: number | string | undefined) => {
    const n = Number(value ?? 0) || 0;
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // prefer detailed calculation when details exist, otherwise fall back to server-provided total_amount
  const calculateOrderTotal = (order: OrderType | null | undefined) => {
    if (!order) return 0;
    const details = Array.isArray(order.order_details) ? order.order_details : [];
    if (details.length > 0) {
      return details.reduce((total, d) => {
        const q = Number(d.quantity) || 0;
        const p = Number(d.unit_price) || 0;
        return total + q * p;
      }, 0);
    }
    return Number((order as any).total_amount ?? 0);
  };

  // fetch full order by id. if returned order_details empty, fallback to GET /order-details and filter.
  const fetchFullOrder = async (orderId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      // try GET /orders/{id}
      const resp = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_BY_ID(orderId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let order: any = resp.data;
      // normalize
      order.order_details = Array.isArray(order.order_details) ? order.order_details : [];

      // if backend didn't include details, fallback to GET /order-details and filter
      if (!order.order_details.length) {
        // ensure endpoint exists in API_CONFIG
        if (API_CONFIG.ENDPOINTS.ORDER_DETAILS) {
          const detResp = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_DETAILS}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const allDetails = Array.isArray(detResp.data) ? detResp.data : [];
          order.order_details = allDetails.filter((d: any) => Number(d.order_id) === Number(order.order_id));
        }
      }

      // ensure numeric types
      order.total_amount = order.total_amount !== undefined && order.total_amount !== null
        ? Number(order.total_amount)
        : calculateOrderTotal(order);
      order.order_details = (order.order_details || []).map((d: any) => ({
        ...d,
        product_id: Number(d.product_id),
        quantity: Number(d.quantity),
        unit_price: Number(d.unit_price),
        total_price: d.total_price !== undefined && d.total_price !== null ? Number(d.total_price) : (Number(d.quantity) || 0) * (Number(d.unit_price) || 0),
      }));

      return order as OrderType;
    } catch (err) {
      console.error('fetchFullOrder error', err?.response?.data ?? err);
      throw err;
    }
  };

  const handleView = async (order: OrderType) => {
    setViewLoading(true);
    try {
      const full = await fetchFullOrder(order.order_id!);
      setViewingOrder(full);
      setViewDialogOpen(true);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch order details', variant: 'destructive' });
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = async (order: OrderType) => {
    setEditLoading(true);
    try {
      const full = await fetchFullOrder(order.order_id!);
      // deep clone for safe edits
      const cloned = JSON.parse(JSON.stringify(full)) as OrderType;
      cloned.order_details = Array.isArray(cloned.order_details) ? cloned.order_details : [];
      setEditingOrder(cloned);
      setEditDialogOpen(true);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch order details for edit', variant: 'destructive' });
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editingOrder || !editingOrder.order_id) return;

    try {
      const token = localStorage.getItem('access_token');

      // normalize order details and compute totals
      const details = (editingOrder.order_details || []).map((d: OrderDetailType) => {
        const quantity = Number(d.quantity) || 0;
        const unit_price = Number(d.unit_price) || 0;
        return {
          ...d,
          quantity,
          unit_price,
          total_price: parseFloat((quantity * unit_price).toFixed(2)),
        } as OrderDetailType & { total_price: number };
      });

      const total_amount = parseFloat(
        details.reduce((sum, d) => sum + (d.total_price ?? 0), 0).toFixed(2)
      );

      const { order_id } = editingOrder;
      const payload: any = {
        ...editingOrder,
        order_details: details,
        total_amount,
      };

      // Remove read-only props that backend might not expect
      delete payload.order_id;

      await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_BY_ID(order_id)}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: 'Success', description: 'Order updated successfully' });
      setEditDialogOpen(false);
      setEditingOrder(null);
      onRefresh();
    } catch (err: any) {
      console.error('Update order error', err?.response?.data ?? err);
      toast({ title: 'Error', description: 'Failed to update order', variant: 'destructive' });
    }
  };

  const handleDeleteOrder = async (orderId?: number) => {
    if (!orderId) return;
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_BY_ID(orderId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: 'Success', description: 'Order deleted successfully' });
      onRefresh();
    } catch (err) {
      console.error('Delete order error', err?.response?.data ?? err);
      toast({ title: 'Error', description: 'Failed to delete order', variant: 'destructive' });
    }
  };

  const updateOrderDetail = (index: number, field: keyof OrderDetailType, value: number) => {
    if (!editingOrder) return;
    const newDetails = [...(editingOrder.order_details || [])];
    newDetails[index] = { ...newDetails[index], [field]: value } as OrderDetailType;
    setEditingOrder({ ...editingOrder, order_details: newDetails });
  };

  const addOrderDetail = () => {
    if (!editingOrder) return;
    const defaultProduct = products?.[0]?.product_id ?? 0;
    const newDetails = [...(editingOrder.order_details || []), { product_id: defaultProduct, quantity: 1, unit_price: 0 }];
    setEditingOrder({ ...editingOrder, order_details: newDetails });
  };

  const removeOrderDetail = (index: number) => {
    if (!editingOrder) return;
    const newDetails = (editingOrder.order_details || []).filter((_, i) => i !== index);
    setEditingOrder({ ...editingOrder, order_details: newDetails });
  };

  if (loading) return <div className="flex justify-center p-8">Loading orders...</div>;

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
                <TableHead className="text-right">Total</TableHead>
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
                  <TableCell className="text-right">Rp.{formatCurrency(calculateOrderTotal(order))}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(order)} disabled={viewLoading}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(order)} disabled={editLoading}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteOrder(order.order_id)}>
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{viewingOrder?.order_id}</DialogTitle>
          </DialogHeader>

          {viewingOrder ? (
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
                  {(viewingOrder.order_details || []).map((detail, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{getProductName(detail.product_id)}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {detail.quantity} × Rp.{formatCurrency(detail.unit_price)}</p>
                        </div>
                      </div>
                      <div className="font-medium">Rp.{formatCurrency((Number(detail.quantity) || 0) * (Number(detail.unit_price) || 0))}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-muted rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold">Rp.{formatCurrency(calculateOrderTotal(viewingOrder))}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">Loading details...</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Order - #{editingOrder?.order_id}</DialogTitle>
          </DialogHeader>

          {editingOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_phone_number">Phone Number</Label>
                  <Input id="edit_phone_number" type="number" value={editingOrder.phone_number} onChange={(e) => setEditingOrder({ ...editingOrder, phone_number: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label htmlFor="edit_order_date">Order Date</Label>
                  <Input id="edit_order_date" type="date" value={editingOrder.order_date} onChange={(e) => setEditingOrder({ ...editingOrder, order_date: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={editingOrder.status} onValueChange={(value) => setEditingOrder({ ...editingOrder, status: value })}>
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
                  <Button type="button" variant="outline" size="sm" onClick={addOrderDetail}>Add Item</Button>
                </div>

                {(editingOrder.order_details || []).map((detail, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 mb-3 p-3 border rounded">
                    <div>
                      <Label>Product</Label>
                      <Select value={(detail.product_id ?? 0).toString()} onValueChange={(value) => updateOrderDetail(index, 'product_id', parseInt(value) || 0)}>
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
                      <Input type="number" min={1} value={detail.quantity} onChange={(e) => updateOrderDetail(index, 'quantity', parseInt(e.target.value) || 1)} />
                    </div>

                    <div>
                      <Label>Unit Price</Label>
                      <Input type="number" step="0.01" min={0} value={detail.unit_price} onChange={(e) => updateOrderDetail(index, 'unit_price', parseFloat(e.target.value) || 0)} />
                    </div>

                    <div className="flex items-end">
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeOrderDetail(index)} disabled={(editingOrder.order_details || []).length === 1}>Remove</Button>
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-3 bg-muted rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold">Rp.{formatCurrency(calculateOrderTotal(editingOrder))}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingOrder(null); }}>Cancel</Button>
                <Button onClick={handleUpdateOrder}>Update Order</Button>
              </div>
            </div>
          ) : (
            <div className="p-6">Loading details...</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
