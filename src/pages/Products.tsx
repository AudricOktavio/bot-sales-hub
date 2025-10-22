import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ProductTable from "@/components/ProductTable";
import sapLogo from "@/assets/sap-logo.svg";
import odooLogo from "@/assets/odoo-logo.svg";
import { Settings, Trash2 } from "lucide-react";
import { API_CONFIG } from "@/config/api";
import axios from "axios";

interface ApiProduct {
  product_id: number;
  product_name: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  sku: string;
  description?: string;
  source?: "sap" | "odoo" | "manual";
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [editingProduct, setEditingProduct] = useState<Product>({
    id: 0,
    name: "",
    category: "",
    price: 0,
    stock: 0,
    status: "active",
    sku: "",
    description: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [importText, setImportText] = useState("");

  // ERP provider states
  const [sapProvider, setSapProvider] = useState<any | null>(null);
  const [odooProvider, setOdooProvider] = useState<any | null>(null);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchProviders();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const apiProducts: ApiProduct[] = response.data;

      const formattedProducts: Product[] = apiProducts.map((product) => {
        // Determine source based on category or description
        let source: "sap" | "odoo" | "manual" = "manual";
        if (
          product.category.toLowerCase() === "sap" ||
          product.description?.includes("SAP")
        ) {
          source = "sap";
        } else if (
          product.category.toLowerCase() === "odoo" ||
          product.description?.includes("Odoo")
        ) {
          source = "odoo";
        }

        return {
          id: product.product_id,
          name: product.product_name,
          category: product.category,
          price: product.price,
          stock: product.quantity,
          status: "active",
          sku: `PRD-${product.product_id.toString().padStart(3, "0")}`,
          description: product.description,
          source,
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  const fetchProviders = async () => {
    setIsProvidersLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [sapResponse, odooResponse] = await Promise.allSettled([
        axios.get(`${API_CONFIG.BASE_URL}/sap/provider`, { headers }),
        axios.get(`${API_CONFIG.BASE_URL}/odoo/provider`, { headers }),
      ]);

      // Handle SAP provider
      if (
        sapResponse.status === "fulfilled" &&
        sapResponse.value.data &&
        Object.keys(sapResponse.value.data).length > 0
      ) {
        setSapProvider(sapResponse.value.data);
      } else {
        setSapProvider(null);
      }

      // Handle Odoo provider
      if (
        odooResponse.status === "fulfilled" &&
        odooResponse.value.data &&
        Object.keys(odooResponse.value.data).length > 0
      ) {
        setOdooProvider(odooResponse.value.data);
      } else {
        setOdooProvider(null);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      setSapProvider(null);
      setOdooProvider(null);
    } finally {
      setIsProvidersLoading(false);
    }
  };

  const syncProductsFromSap = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_CONFIG.BASE_URL}/sap/sync-products`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: "SAP Sync Complete",
        description: "Products have been synced from SAP B1",
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error syncing from SAP:", error);
      toast({
        title: "Error",
        description: "Failed to sync products from SAP",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncProductsFromOdoo = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_CONFIG.BASE_URL}/odoo/sync-products`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: "Odoo Sync Complete",
        description: "Products have been synced from Odoo",
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error syncing from Odoo:", error);
      toast({
        title: "Error",
        description: "Failed to sync products from Odoo",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Get unique categories for filter
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesSource =
      sourceFilter === "all" || product.source === sourceFilter;

    return matchesSearch && matchesCategory && matchesSource;
  });

  const handleCreateProduct = () => {
    setIsEditing(false);
    setEditingProduct({
      id: 0,
      name: "",
      category: "",
      price: 0,
      stock: 0,
      status: "active",
      sku: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = async (product: Product) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/products/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const apiProduct: ApiProduct = response.data;

      setIsEditing(true);
      setEditingProduct({
        id: apiProduct.product_id,
        name: apiProduct.product_name,
        category: apiProduct.category,
        price: apiProduct.price,
        stock: apiProduct.quantity,
        status: "active",
        sku: `PRD-${apiProduct.product_id.toString().padStart(3, "0")}`,
        description: apiProduct.description,
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product details",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_CONFIG.BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(products.filter((product) => product.id !== productId));
      toast({
        title: "Product Deleted",
        description: "The product has been removed from your catalog",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleSaveProduct = async () => {
    if (
      !editingProduct.name ||
      !editingProduct.category ||
      !editingProduct.price
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        product_name: editingProduct.name,
        category: editingProduct.category,
        description: editingProduct.description || "",
        price: editingProduct.price,
        quantity: editingProduct.stock,
      };

      if (isEditing) {
        await axios.put(
          `${API_CONFIG.BASE_URL}/products/${editingProduct.id}`,
          payload,
          { headers }
        );
        toast({
          title: "Product Updated",
          description: `${editingProduct.name} has been updated successfully`,
        });
      } else {
        await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS_CREATE}`,
          payload,
          { headers }
        );
        toast({
          title: "Product Created",
          description: `${editingProduct.name} has been added to your catalog`,
        });
      }

      await fetchProducts();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

      const rows = importText.trim().split("\n");
      const newProducts: Product[] = [];
      const startIdx = rows[0].includes("name,category,price") ? 1 : 0;

      for (let i = startIdx; i < rows.length; i++) {
        const columns = rows[i].split(",");

        if (columns.length >= 3) {
          const newId =
            Math.max(...products.map((p) => p.id), 0) + newProducts.length + 1;
          newProducts.push({
            id: newId,
            name: columns[0].trim(),
            category: columns[1].trim(),
            price: parseFloat(columns[2].trim().replace("$", "")) || 0,
            stock: parseInt(columns[3]?.trim() || "100"),
            status: "active",
            sku:
              columns[4]?.trim() || `IMPORT-${String(newId).padStart(3, "0")}`,
            description: columns[5]?.trim() || "",
          });
        }
      }

      if (newProducts.length > 0) {
        setProducts([...products, ...newProducts]);
        setIsImportDialogOpen(false);
        setImportText("");
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
          <p className="text-muted-foreground mt-1">
            Manage products and services offered by your AI agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateProduct}>Add Product</Button>
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            Import
          </Button>
          {!isProvidersLoading && sapProvider && (
            <Button
              variant="outline"
              onClick={syncProductsFromSap}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <span className="animate-spin border-2 border-t-transparent border-gray-500 rounded-full w-4 h-4"></span>
                  Syncing...
                </>
              ) : (
                <>
                  <img src={sapLogo} alt="SAP" className="h-4 w-8" />
                  SAP Sync
                </>
              )}
            </Button>
          )}
          {!isProvidersLoading && odooProvider && (
            <Button
              variant="outline"
              onClick={syncProductsFromOdoo}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <span className="animate-spin border-2 border-t-transparent border-gray-500 rounded-full w-4 h-4"></span>
                  Syncing...
                </>
              ) : (
                <>
                  <img src={odooLogo} alt="Odoo" className="h-3 w-8" />
                  Odoo Sync
                </>
              )}
            </Button>
          )}
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
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="sap">SAP Products</SelectItem>
            <SelectItem value="odoo">Odoo Products</SelectItem>
            <SelectItem value="manual">Manual Products</SelectItem>
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
            <DialogTitle>
              {isEditing ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the product details below."
                : "Fill in the product details to add it to your catalog."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
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
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingProduct.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setEditingProduct({ ...editingProduct, status: value })
                  }
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
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      sku: e.target.value,
                    })
                  }
                  placeholder={isEditing ? "" : "Auto-generated if left blank"}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingProduct.description || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProduct} disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEditing
                ? "Update Product"
                : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Paste your CSV data below. Format:
              name,category,price,stock,sku,description
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
              Example: Enterprise CRM,Software,499.99,1000,SW-CRM-001,Complete
              CRM solution
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleImport}>Import Products</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
