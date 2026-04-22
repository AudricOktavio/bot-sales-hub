import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { API_CONFIG } from "@/config/api";
import axios from "axios";

interface ApiProduct {
  product_id: number;
  product_name: string;
  category: string;
  description: string;
  price: number;
  quantity: number;

  uom?: string | null;
  conversion?: string | null;
  pre_order_moq?: number | null;
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
  source?: "sap" | "odoo" | "accurate" | "manual";

  uom?: string | null;
  conversion?: string | null;
  preOrderMoq?: number | null;
}

type OptionalColumns = {
  uom: boolean;
  conversion: boolean;
  moq: boolean;
};

const OPT_COLS_KEY = "products_optional_columns";

const normalizeOptionalString = (value: string | null | undefined) => {
  const v = (value ?? "").trim();
  return v === "" ? null : v;
};

const readOptionalCols = (): OptionalColumns => {
  try {
    const raw = localStorage.getItem(OPT_COLS_KEY);
    if (!raw) return { uom: false, conversion: false, moq: false };
    const parsed = JSON.parse(raw);
    return {
      uom: !!parsed?.uom,
      conversion: !!parsed?.conversion,
      moq: !!parsed?.moq,
    };
  } catch {
    return { uom: false, conversion: false, moq: false };
  }
};

const writeOptionalCols = (cols: OptionalColumns) => {
  localStorage.setItem(OPT_COLS_KEY, JSON.stringify(cols));
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // ✅ CLIENT-level optional columns (3 independent toggles)
  const [optionalCols, setOptionalCols] = useState<OptionalColumns>(() =>
    readOptionalCols()
  );

  const [editingProduct, setEditingProduct] = useState<Product>({
    id: 0,
    name: "",
    category: "",
    price: 0,
    stock: 0,
    status: "active",
    sku: "",
    description: "",
    uom: null,
    conversion: null,
    preOrderMoq: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  // ---- Import UI state (NEW) ----
  const [importText, setImportText] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // ERP provider states
  const [sapProvider, setSapProvider] = useState<any | null>(null);
  const [odooProvider, setOdooProvider] = useState<any | null>(null);
  const [accurateProvider, setAccurateProvider] = useState<any | null>(null);
  const [isProvidersLoading, setIsProvidersLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const apiProducts: ApiProduct[] = response.data;

      const formattedProducts: Product[] = apiProducts.map((product) => {
        let source: "sap" | "odoo" | "accurate" | "manual" = "manual";
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
        } else if (
          product.category.toLowerCase() === "accurate" ||
          product.description?.toLowerCase()?.includes("accurate")
        ) {
          source = "accurate";
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
          uom: product.uom ?? null,
          conversion: product.conversion ?? null,
          preOrderMoq: product.pre_order_moq ?? null,
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

      const [sapResponse, odooResponse, accurateResponse] =
        await Promise.allSettled([
          axios.get(`${API_CONFIG.BASE_URL}/sap/provider`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}/odoo/provider`, { headers }),
          axios.get(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCURATE_PROVIDER}`,
            { headers }
          ),
        ]);

      if (
        sapResponse.status === "fulfilled" &&
        sapResponse.value.data &&
        Object.keys(sapResponse.value.data).length > 0
      )
        setSapProvider(sapResponse.value.data);
      else setSapProvider(null);

      if (
        odooResponse.status === "fulfilled" &&
        odooResponse.value.data &&
        Object.keys(odooResponse.value.data).length > 0
      )
        setOdooProvider(odooResponse.value.data);
      else setOdooProvider(null);

      if (
        accurateResponse.status === "fulfilled" &&
        accurateResponse.value.data &&
        Object.keys(accurateResponse.value.data).length > 0
      )
        setAccurateProvider(accurateResponse.value.data);
      else setAccurateProvider(null);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setSapProvider(null);
      setOdooProvider(null);
      setAccurateProvider(null);
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
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
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

  const syncProductsFromAccurate = async () => {
    setIsSyncing(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ACCURATE_SYNC_PRODUCTS}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Accurate Sync Complete",
        description: "Products have been synced from Accurate",
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error syncing from Accurate:", error);
      toast({
        title: "Error",
        description: "Failed to sync products from Accurate",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const st = searchTerm.toLowerCase();

    const baseMatch =
      product.name.toLowerCase().includes(st) ||
      product.sku.toLowerCase().includes(st) ||
      (product.description ?? "").toLowerCase().includes(st);

    const optMatch =
      (optionalCols.uom && (product.uom ?? "").toLowerCase().includes(st)) ||
      (optionalCols.conversion &&
        (product.conversion ?? "").toLowerCase().includes(st)) ||
      (optionalCols.moq &&
        String(product.preOrderMoq ?? "").includes(searchTerm));

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    const matchesSource =
      sourceFilter === "all" || product.source === sourceFilter;

    return (baseMatch || optMatch) && matchesCategory && matchesSource;
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
      uom: null,
      conversion: null,
      preOrderMoq: null,
    });
    setIsDialogOpen(true);
  };

  const handleEditProduct = async (product: Product) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/products/${product.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
        uom: apiProduct.uom ?? null,
        conversion: apiProduct.conversion ?? null,
        preOrderMoq: apiProduct.pre_order_moq ?? null,
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
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

        // ✅ per-field toggle -> NULL if disabled
        uom: optionalCols.uom
          ? normalizeOptionalString(editingProduct.uom)
          : null,
        conversion: optionalCols.conversion
          ? normalizeOptionalString(editingProduct.conversion)
          : null,
        pre_order_moq: optionalCols.moq
          ? editingProduct.preOrderMoq ?? null
          : null,
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

  // ✅ toggle helper
  const setOptional = (patch: Partial<OptionalColumns>) => {
    setOptionalCols((prev) => {
      const next = { ...prev, ...patch };
      writeOptionalCols(next);

      // if disabling, clear draft values
      setEditingProduct((p) => ({
        ...p,
        uom: next.uom ? p.uom : null,
        conversion: next.conversion ? p.conversion : null,
        preOrderMoq: next.moq ? p.preOrderMoq : null,
      }));

      return next;
    });
  };

  // ---------------- IMPORT: FILE (NEW) ----------------
  const buildAllowedColumnsForImport = (): string => {
    // backend column names
    const cols: string[] = ["category", "description", "price", "quantity"];
    if (optionalCols.uom) cols.push("uom");
    if (optionalCols.conversion) cols.push("conversion");
    if (optionalCols.moq) cols.push("pre_order_moq");
    return cols.join(",");
  };

  const handleImportFile = async () => {
    if (!importFile) {
      toast({
        title: "Import Failed",
        description: "Please choose an Excel file first (.xlsx/.xls).",
        variant: "destructive",
      });
      return;
    }

    // backend you showed only supports Excel
    const lower = importFile.name.toLowerCase();
    if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
      toast({
        title: "Invalid File",
        description: "Backend currently accepts only .xlsx or .xls",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const token = localStorage.getItem("access_token");

      const fd = new FormData();
      fd.append("file", importFile);
      fd.append("column_list", buildAllowedColumnsForImport());

      const res = await axios.post(
        `${API_CONFIG.BASE_URL}/products/update-from-excel`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast({
        title: "Import Complete",
        description: res?.data?.message ?? "Products imported successfully",
      });

      await fetchProducts();
      setIsImportDialogOpen(false);
      setImportFile(null);
      setImportText("");
    } catch (error: any) {
      console.error("Import error:", error);

      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to import products";

      toast({
        title: "Import Failed",
        description: String(detail),
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // ---------------- IMPORT: PASTE CSV (kept as-is) ----------------
  const handleImportPaste = () => {
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
            price:
              parseFloat(
                columns[2]
                  .trim()
                  .replace(/[^\d.,-]/g, "")
                  .replace(/,/g, "")
              ) || 0,
            stock: parseInt(columns[3]?.trim() || "100"),
            status: "active",
            sku:
              columns[4]?.trim() || `IMPORT-${String(newId).padStart(3, "0")}`,
            description: columns[5]?.trim() || "",
            uom: null,
            conversion: null,
            preOrderMoq: null,
          });
        }
      }

      if (newProducts.length > 0) {
        setProducts((prev) => [...prev, ...newProducts]);
        setIsImportDialogOpen(false);
        setImportText("");
        setImportFile(null);
        toast({
          title: "Import Successful",
          description: `${newProducts.length} products imported to your catalog (local only)`,
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

        <div className="flex flex-wrap items-center gap-2">
          {/* ✅ 3 independent toggles */}
          <div className="flex items-center gap-3 rounded-md border px-3 py-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="opt-uom"
                checked={optionalCols.uom}
                onCheckedChange={(c) => setOptional({ uom: c === true })}
              />
              <Label htmlFor="opt-uom" className="cursor-pointer">
                UoM
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="opt-conversion"
                checked={optionalCols.conversion}
                onCheckedChange={(c) => setOptional({ conversion: c === true })}
              />
              <Label htmlFor="opt-conversion" className="cursor-pointer">
                Conversion
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="opt-moq"
                checked={optionalCols.moq}
                onCheckedChange={(c) => setOptional({ moq: c === true })}
              />
              <Label htmlFor="opt-moq" className="cursor-pointer">
                MOQ
              </Label>
            </div>
          </div>

          <Button onClick={handleCreateProduct}>Add Product</Button>

          <Button
            variant="outline"
            onClick={() => {
              setIsImportDialogOpen(true);
              setImportFile(null);
              setImportText("");
            }}
          >
            Import
          </Button>

          {!isProvidersLoading && accurateProvider?.is_active && (
            <Button
              variant="outline"
              onClick={syncProductsFromAccurate}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <span className="animate-spin border-2 border-t-transparent border-gray-500 rounded-full w-4 h-4"></span>
                  Syncing...
                </>
              ) : (
                <>Accurate Sync</>
              )}
            </Button>
          )}

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
            <SelectItem value="accurate">Accurate Products</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ProductTable
        products={filteredProducts}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        showColumns={optionalCols}
      />

      {/* Product Editor Dialog (unchanged from your version) */}
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

              {/* UoM disabled if not enabled */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="uom">Unit of Measurement (UoM)</Label>
                  {!optionalCols.uom && (
                    <span className="text-xs text-muted-foreground">
                      Check “UoM” above to enable
                    </span>
                  )}
                </div>
                <Input
                  id="uom"
                  disabled={!optionalCols.uom}
                  value={optionalCols.uom ? editingProduct.uom ?? "" : ""}
                  onChange={(e) => {
                    if (!optionalCols.uom) return;
                    setEditingProduct({
                      ...editingProduct,
                      uom: e.target.value,
                    });
                  }}
                  placeholder={
                    optionalCols.uom
                      ? 'e.g., "Roll", "Sak"'
                      : "Enable UoM first"
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

              {/* MOQ disabled if not enabled */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="preOrderMoq">Pre-order MOQ</Label>
                  {!optionalCols.moq && (
                    <span className="text-xs text-muted-foreground">
                      Check “MOQ” above to enable
                    </span>
                  )}
                </div>
                <Input
                  id="preOrderMoq"
                  type="number"
                  disabled={!optionalCols.moq}
                  value={
                    optionalCols.moq ? editingProduct.preOrderMoq ?? "" : ""
                  }
                  onChange={(e) => {
                    if (!optionalCols.moq) return;
                    setEditingProduct({
                      ...editingProduct,
                      preOrderMoq:
                        e.target.value === ""
                          ? null
                          : parseFloat(e.target.value) || 0,
                    });
                  }}
                  placeholder={
                    optionalCols.moq ? "e.g., 100" : "Enable MOQ first"
                  }
                />
              </div>
            </div>

            {/* Conversion disabled if not enabled */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="conversion">Conversion</Label>
                {!optionalCols.conversion && (
                  <span className="text-xs text-muted-foreground">
                    Check “Conversion” above to enable
                  </span>
                )}
              </div>
              <Textarea
                id="conversion"
                disabled={!optionalCols.conversion}
                value={
                  optionalCols.conversion ? editingProduct.conversion ?? "" : ""
                }
                onChange={(e) => {
                  if (!optionalCols.conversion) return;
                  setEditingProduct({
                    ...editingProduct,
                    conversion: e.target.value,
                  });
                }}
                rows={2}
                placeholder={
                  optionalCols.conversion
                    ? 'e.g., "60 yard, 55 meter"'
                    : "Enable Conversion first"
                }
              />
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

      {/* ✅ Import Dialog (UPDATED: file upload + paste) */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Upload an Excel file (.xlsx/.xls) to bulk create/update products.
              <br />
              Supported columns:{" "}
              <span className="font-mono">
                product_name, category, description, price, quantity, uom,
                conversion, pre_order_moq
              </span>
              <br />
              (Missing columns are skipped; defaults will be used for new
              products.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* ✅ Upload file */}
            <div className="space-y-2">
              <Label htmlFor="importFile">Upload Excel File</Label>
              <Input
                id="importFile"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
              <div className="text-xs text-muted-foreground">
                Column list sent to backend:{" "}
                <span className="font-mono">
                  {buildAllowedColumnsForImport()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportFile(null);
                  setImportText("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleImportFile} disabled={isImporting}>
                {isImporting ? "Importing..." : "Import Products"}
              </Button>
            </div>

            {/* Optional: keep paste CSV section */}
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">
                Paste CSV (optional)
              </div>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="name,category,price,stock,sku,description"
                rows={6}
                className="font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground mt-2">
                This paste-import is local-only in your current UI (does not
                call backend).
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <Button variant="outline" onClick={() => setImportText("")}>
                  Clear
                </Button>
                <Button onClick={handleImportPaste}>Import CSV (Local)</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
