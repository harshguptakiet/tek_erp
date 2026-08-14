/**
 * Inventory & Assets Management Component
 * Comprehensive inventory tracking with categories, stock levels, and asset lifecycle
 * Features: Stock management, low stock alerts, asset assignment, maintenance tracking
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  Box,
  Laptop,
  BookOpen,
  Wrench,
  FileText,
} from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { cn } from '@/lib/utils';

const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  sku: z.string().min(1, 'SKU is required'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  minStockLevel: z.number().min(0, 'Min stock level must be non-negative'),
  maxStockLevel: z.number().min(0, 'Max stock level must be non-negative'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  location: z.string().optional(),
  supplier: z.string().optional(),
  description: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

const categories = [
  { value: 'ELECTRONICS', label: 'Electronics', icon: Laptop },
  { value: 'FURNITURE', label: 'Furniture', icon: Box },
  { value: 'BOOKS', label: 'Books & Stationery', icon: BookOpen },
  { value: 'TOOLS', label: 'Tools & Equipment', icon: Wrench },
  { value: 'DOCUMENTS', label: 'Documents & Forms', icon: FileText },
  { value: 'OTHER', label: 'Other', icon: Package },
];

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  totalValue: number;
  location: string;
  supplier: string;
  lastUpdated: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Mock data - replace with actual API calls
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'HP Laptop ProBook 450',
      category: 'ELECTRONICS',
      sku: 'LPT-HP-450',
      quantity: 25,
      minStockLevel: 10,
      maxStockLevel: 50,
      unitPrice: 45000,
      totalValue: 1125000,
      location: 'IT Store Room',
      supplier: 'HP India',
      lastUpdated: new Date().toISOString(),
      status: 'IN_STOCK',
    },
    {
      id: '2',
      name: 'Student Desk with Chair',
      category: 'FURNITURE',
      sku: 'FRN-DSK-001',
      quantity: 8,
      minStockLevel: 15,
      maxStockLevel: 100,
      unitPrice: 3500,
      totalValue: 28000,
      location: 'Furniture Warehouse',
      supplier: 'Local Furniture Co.',
      lastUpdated: new Date().toISOString(),
      status: 'LOW_STOCK',
    },
    {
      id: '3',
      name: 'Whiteboard Markers (Box of 12)',
      category: 'BOOKS',
      sku: 'STN-MRK-012',
      quantity: 0,
      minStockLevel: 20,
      maxStockLevel: 100,
      unitPrice: 250,
      totalValue: 0,
      location: 'Stationery Room',
      supplier: 'Camlin Ltd.',
      lastUpdated: new Date().toISOString(),
      status: 'OUT_OF_STOCK',
    },
  ]);

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      quantity: 0,
      minStockLevel: 10,
      maxStockLevel: 100,
      unitPrice: 0,
    },
  });

  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + item.totalValue, 0),
    lowStock: items.filter((item) => item.status === 'LOW_STOCK').length,
    outOfStock: items.filter((item) => item.status === 'OUT_OF_STOCK').length,
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'low' && item.status === 'LOW_STOCK') ||
      (activeTab === 'out' && item.status === 'OUT_OF_STOCK');
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleAddItem = (data: ItemFormData) => {
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      ...data,
      totalValue: data.quantity * data.unitPrice,
      lastUpdated: new Date().toISOString(),
      status:
        data.quantity === 0
          ? 'OUT_OF_STOCK'
          : data.quantity <= data.minStockLevel
          ? 'LOW_STOCK'
          : 'IN_STOCK',
      location: data.location || '',
      supplier: data.supplier || '',
    };
    setItems([...items, newItem]);
    setShowAddDialog(false);
    form.reset();
  };

  const handleEditItem = (data: ItemFormData) => {
    if (!editingItem) return;
    const updatedItems = items.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            ...data,
            totalValue: data.quantity * data.unitPrice,
            lastUpdated: new Date().toISOString(),
            status:
              data.quantity === 0
                ? 'OUT_OF_STOCK'
                : data.quantity <= data.minStockLevel
                ? 'LOW_STOCK'
                : 'IN_STOCK',
            location: data.location || '',
            supplier: data.supplier || '',
          }
        : item
    );
    setItems(updatedItems);
    setEditingItem(null);
    form.reset();
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      category: item.category,
      sku: item.sku,
      quantity: item.quantity,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      unitPrice: item.unitPrice,
      location: item.location,
      supplier: item.supplier,
    });
  };

  const columns = [
    {
      header: 'Item',
      accessorKey: 'name',
      cell: ({ row }: any) => (
        <div>
          <p className="font-semibold text-gray-900">{row.original.name}</p>
          <p className="text-xs text-gray-600">SKU: {row.original.sku}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: ({ row }: any) => {
        const category = categories.find((c) => c.value === row.original.category);
        return (
          <Badge variant="secondary">
            {category?.label || row.original.category}
          </Badge>
        );
      },
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
      cell: ({ row }: any) => {
        const { quantity, minStockLevel, status } = row.original;
        return (
          <div>
            <p className="font-semibold text-gray-900">{quantity}</p>
            <p className="text-xs text-gray-600">Min: {minStockLevel}</p>
            {status === 'LOW_STOCK' && (
              <AlertTriangle className="h-3 w-3 text-orange-600 inline ml-1" />
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'IN_STOCK' ? 'default' : status === 'LOW_STOCK' ? 'warning' : 'destructive'
            }
          >
            {status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      header: 'Unit Price',
      accessorKey: 'unitPrice',
      cell: ({ row }: any) => `₹${row.original.unitPrice.toLocaleString()}`,
    },
    {
      header: 'Total Value',
      accessorKey: 'totalValue',
      cell: ({ row }: any) => `₹${row.original.totalValue.toLocaleString()}`,
    },
    {
      header: 'Location',
      accessorKey: 'location',
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => openEditDialog(row.original)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteItem(row.original.id)}
          >
            <Trash2 className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <Package className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{(stats.totalValue / 100000).toFixed(1)}L
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-3xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <TrendingDown className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.outOfStock > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats.outOfStock} item{stats.outOfStock > 1 ? 's are' : ' is'} out of stock. Order
            immediately!
          </AlertDescription>
        </Alert>
      )}

      {stats.lowStock > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats.lowStock} item{stats.lowStock > 1 ? 's are' : ' is'} running low on stock.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <SelectRoot value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
          <TabsTrigger value="low">
            Low Stock ({stats.lowStock})
          </TabsTrigger>
          <TabsTrigger value="out">
            Out of Stock ({stats.outOfStock})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <DataTable columns={columns} data={filteredItems} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || editingItem !== null} onOpenChange={() => {
        setShowAddDialog(false);
        setEditingItem(null);
        form.reset();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update item details' : 'Add a new item to the inventory'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(editingItem ? handleEditItem : handleAddItem)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., HP Laptop ProBook 450"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <SelectRoot
                  value={form.watch('category')}
                  onValueChange={(value) => form.setValue('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  placeholder="e.g., LPT-HP-450"
                  {...form.register('sku')}
                />
                {form.formState.errors.sku && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.sku.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="quantity">Current Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  {...form.register('quantity', { valueAsNumber: true })}
                />
                {form.formState.errors.quantity && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.quantity.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  {...form.register('unitPrice', { valueAsNumber: true })}
                />
                {form.formState.errors.unitPrice && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.unitPrice.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="minStockLevel">Min Stock Level *</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  {...form.register('minStockLevel', { valueAsNumber: true })}
                />
                {form.formState.errors.minStockLevel && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.minStockLevel.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="maxStockLevel">Max Stock Level *</Label>
                <Input
                  id="maxStockLevel"
                  type="number"
                  {...form.register('maxStockLevel', { valueAsNumber: true })}
                />
                {form.formState.errors.maxStockLevel && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.maxStockLevel.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., IT Store Room"
                  {...form.register('location')}
                />
              </div>

              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="e.g., HP India"
                  {...form.register('supplier')}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Additional details about the item..."
                  {...form.register('description')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingItem(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
