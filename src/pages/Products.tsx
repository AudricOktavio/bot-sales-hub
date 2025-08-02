
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ProductTable from '@/components/ProductTable';
import sapLogo from '@/assets/sap-logo.png';

// Demo data for products
const initialProducts = [
  {
    id: 1,
    name: "Enterprise Cloud Storage",
    category: "Cloud Services",
    price: "$499.99",
    stock: 999,
    status: "active" as const,
    sku: "CS-ECS-001",
    description: "High-performance cloud storage solution for businesses with advanced security features."
  },
  {
    id: 2,
    name: "Professional CRM License",
    category: "Software",
    price: "$299.99",
    stock: 500,
    status: "active" as const,
    sku: "SW-CRM-002",
    description: "Complete customer relationship management platform with AI-powered insights."
  },
  {
    id: 3,
    name: "Business Laptop Pro",
    category: "Hardware",
    price: "$1,299.99",
    stock: 42,
    status: "active" as const,
    sku: "HW-LPT-003",
    description: "High-performance business laptop with enhanced security features."
  },
  {
    id: 4,
    name: "Smart Office Bundle",
    category: "IoT",
    price: "$599.99",
    stock: 27,
    status: "active" as const,
    sku: "IOT-SOB-004",
    description: "Complete smart office solution with connected devices and central management."
  },
  {
    id: 5,
    name: "Premium Support Package",
    category: "Services",
    price: "$199.99",
    stock: 999,
    status: "active" as const,
    sku: "SVC-PSP-005",
    description: "24/7 priority support with dedicated technical account manager."
  },
  {
    id: 6,
    name: "Data Security Suite",
    category: "Software",
    price: "$399.99",
    stock: 8,
    status: "active" as const,
    sku: "SW-DSS-006",
    description: "Comprehensive data protection and encryption solution for enterprise use."
  },
  {
    id: 7,
    name: "Advanced Network Switch",
    category: "Hardware",
    price: "$899.99",
    stock: 15,
    status: "active" as const,
    sku: "HW-ANS-007",
    description: "Enterprise-grade network switch with advanced traffic management."
  },
  {
    id: 8,
    name: "Cloud Backup Service",
    category: "Cloud Services",
    price: "$149.99",
    stock: 999,
    status: "inactive" as const,
    sku: "CS-CBS-008",
    description: "Automatic cloud backup service with unlimited storage and file versioning."
  },
];

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: 'active' | 'inactive';
  sku: string;
  description?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();
  
  const [editingProduct, setEditingProduct] = useState<Product>({
    id: 0,
    name: '',
    category: '',
    price: '',
    stock: 0,
    status: 'active',
    sku: '',
    description: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [importText, setImportText] = useState('');
  
  // Get unique categories for filter
  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleCreateProduct = () => {
    setIsEditing(false);
    setEditingProduct({
      id: 0,
      name: '',
      category: '',
      price: '',
      stock: 0,
      status: 'active',
      sku: '',
      description: '',
    });
    setIsDialogOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setEditingProduct({ ...product });
    setIsDialogOpen(true);
  };
  
  const handleDeleteProduct = (productId: number) => {
    setProducts(products.filter(product => product.id !== productId));
    toast({
      title: "Product Deleted",
      description: "The product has been removed from your catalog",
    });
  };
  
  const handleSaveProduct = () => {
    if (!editingProduct.name || !editingProduct.category || !editingProduct.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing) {
      setProducts(products.map(product => 
        product.id === editingProduct.id ? editingProduct : product
      ));
      toast({
        title: "Product Updated",
        description: `${editingProduct.name} has been updated successfully`,
      });
    } else {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      const newSku = `${editingProduct.category.substring(0, 2).toUpperCase()}-${editingProduct.name.substring(0, 3).toUpperCase()}-${String(newId).padStart(3, '0')}`;
      
      setProducts([...products, { 
        ...editingProduct, 
        id: newId,
        sku: editingProduct.sku || newSku,
      }]);
      
      toast({
        title: "Product Created",
        description: `${editingProduct.name} has been added to your catalog`,
      });
    }
    
    setIsDialogOpen(false);
  };
  
  const handleImport = () => {
    try {
      if (!importText.trim()) {
        toast({
          title: "Import Failed",
          description: "Please provide CSV data to import",
          variant: "destructive",
        });
        return;
      }
      
      // Simple CSV parsing (in a real app, use a proper CSV parser)
      const rows = importText.trim().split('\n');
      const newProducts: Product[] = [];
      
      // Skip header row if present
      const startIdx = rows[0].includes('name,category,price') ? 1 : 0;
      
      for (let i = startIdx; i < rows.length; i++) {
        const columns = rows[i].split(',');
        
        if (columns.length >= 3) {
          const newId = Math.max(...products.map(p => p.id), 0) + newProducts.length + 1;
          
          newProducts.push({
            id: newId,
            name: columns[0].trim(),
            category: columns[1].trim(),
            price: columns[2].trim().startsWith('$') ? columns[2].trim() : `$${columns[2].trim()}`,
            stock: parseInt(columns[3]?.trim() || '100'),
            status: 'active',
            sku: columns[4]?.trim() || `IMPORT-${String(newId).padStart(3, '0')}`,
            description: columns[5]?.trim() || '',
          });
        }
      }
      
      if (newProducts.length > 0) {
        setProducts([...products, ...newProducts]);
        setIsImportDialogOpen(false);
        setImportText('');
        
        toast({
          title: "Import Successful",
          description: `${newProducts.length} products imported to your catalog`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: "No valid product data found",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Error processing the CSV data",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="crm-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground mt-1">Manage products and services offered by your AI agents</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateProduct}>Add Product</Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>Import</Button>
          <Button 
            variant="outline" 
            onClick={() => {
              toast({
                title: "SAP Sync Initiated",
                description: "Syncing with SAP B1 for latest product data...",
              });
            }}
            className="flex items-center gap-2"
          >
            <img src={sapLogo} alt="SAP" className="h-4 w-4" />
            SAP Sync
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search products by name, SKU, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <ProductTable
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
      
      {/* Product Editor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the product details below.' : 'Fill in the product details to add it to your catalog.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={editingProduct.status} 
                  onValueChange={(value: 'active' | 'inactive') => setEditingProduct({...editingProduct, status: value})}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={editingProduct.sku}
                  onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                  placeholder={isEditing ? '' : 'Auto-generated if left blank'}
                />
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct}>{isEditing ? 'Update Product' : 'Add Product'}</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Paste your CSV data below. Format: name,category,price,stock,sku,description
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Product A,Category,199.99,100,SKU-001,Description..."
              rows={10}
              className="font-mono text-sm"
            />
            <div className="text-xs text-muted-foreground">
              Example: Enterprise CRM,Software,499.99,1000,SW-CRM-001,Complete CRM solution
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleImport}>Import Products</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
