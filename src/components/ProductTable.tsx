import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import StatusBadge from "./common/StatusBadge";

type OptionalColumns = {
  uom: boolean;
  conversion: boolean;
  moq: boolean;
};

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  sku: string;
  description?: string;

  uom?: string | null;
  conversion?: string | null;
  preOrderMoq?: number | null;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;

  // ✅ make optional so other call sites won't break
  showColumns?: OptionalColumns;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  showColumns,
}: ProductTableProps) => {
  // ✅ default if not provided
  const cols: OptionalColumns = showColumns ?? {
    uom: false,
    conversion: false,
    moq: false,
  };

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "ascending" | "descending";
  } | null>(null);

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    if (!sortConfig) return arr;

    const { key, direction } = sortConfig;
    return arr.sort((a, b) => {
      const aVal = a[key] as any;
      const bVal = b[key] as any;

      const aNorm = aVal === null || aVal === undefined ? "" : aVal;
      const bNorm = bVal === null || bVal === undefined ? "" : bVal;

      if (aNorm < bNorm) return direction === "ascending" ? -1 : 1;
      if (aNorm > bNorm) return direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [products, sortConfig]);

  const requestSort = (key: keyof Product) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const visibleOptionalCount =
    (cols.uom ? 1 : 0) + (cols.conversion ? 1 : 0) + (cols.moq ? 1 : 0);

  // Base columns: Product Name, Category, Price, Stock, Status, Description, Actions = 7
  const colCount = 7 + visibleOptionalCount;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer w-[300px]"
              onClick={() => requestSort("name")}
            >
              Product Name
              {sortConfig?.key === "name" && (
                <span className="ml-1">
                  {sortConfig.direction === "ascending" ? "↑" : "↓"}
                </span>
              )}
            </TableHead>

            <TableHead
              className="cursor-pointer"
              onClick={() => requestSort("category")}
            >
              Category
              {sortConfig?.key === "category" && (
                <span className="ml-1">
                  {sortConfig.direction === "ascending" ? "↑" : "↓"}
                </span>
              )}
            </TableHead>

            <TableHead
              className="cursor-pointer text-right"
              onClick={() => requestSort("price")}
            >
              Price
              {sortConfig?.key === "price" && (
                <span className="ml-1">
                  {sortConfig.direction === "ascending" ? "↑" : "↓"}
                </span>
              )}
            </TableHead>

            <TableHead
              className="cursor-pointer text-right"
              onClick={() => requestSort("stock")}
            >
              Stock
              {sortConfig?.key === "stock" && (
                <span className="ml-1">
                  {sortConfig.direction === "ascending" ? "↑" : "↓"}
                </span>
              )}
            </TableHead>

            {/* ✅ optional headers */}
            {cols.uom && <TableHead>UoM</TableHead>}
            {cols.conversion && <TableHead>Conversion</TableHead>}
            {cols.moq && (
              <TableHead className="text-right">Pre-order MOQ</TableHead>
            )}

            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">
                <div>{product.name}</div>
                <div className="text-xs text-muted-foreground">
                  SKU: {product.sku}
                </div>
              </TableCell>

              <TableCell>{product.category}</TableCell>

              <TableCell className="text-right">
                {formatPrice(product.price)}
              </TableCell>

              <TableCell className="text-right">
                <div className={product.stock <= 10 ? "text-destructive" : ""}>
                  {product.stock}
                </div>
                {product.stock <= 10 && (
                  <div className="text-xs text-destructive">Low stock</div>
                )}
              </TableCell>

              {/* ✅ optional cells */}
              {cols.uom && <TableCell>{product.uom ?? "-"}</TableCell>}

              {cols.conversion && (
                <TableCell
                  className="max-w-[260px] truncate"
                  title={product.conversion ?? ""}
                >
                  {product.conversion ?? "-"}
                </TableCell>
              )}

              {cols.moq && (
                <TableCell className="text-right">
                  {product.preOrderMoq ?? "-"}
                </TableCell>
              )}

              <TableCell>
                <StatusBadge status={product.status} />
              </TableCell>

              <TableCell>{product.description ?? "-"}</TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(product.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}

          {products.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={colCount}
                className="text-center py-10 text-muted-foreground"
              >
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
