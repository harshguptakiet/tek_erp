import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  items: () => [...inventoryKeys.all, 'items'] as const,
  item: (id: string) => [...inventoryKeys.items(), id] as const,
  lowStock: () => [...inventoryKeys.all, 'low-stock'] as const,
};

// Fetch inventory items
export function useInventoryItems(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...inventoryKeys.items(), filters],
    queryFn: () => inventoryService.listItems({ ...filters, schoolId: user?.schoolId }),
    enabled: !!user?.schoolId,
  });
}

// Fetch single item
export function useInventoryItem(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: inventoryKeys.item(id),
    queryFn: () => inventoryService.getItem(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch low stock items
export function useLowStockItems() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => inventoryService.getLowStockItems(user?.schoolId!),
    enabled: !!user?.schoolId,
  });
}

// Add item mutation
export function useAddInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => inventoryService.addItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success('Item added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add item: ${error.message}`);
    },
  });
}

// Update item mutation
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryService.updateItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.item(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success('Item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });
}

// Delete item mutation
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => inventoryService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      toast.success('Item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });
}

// Adjust stock mutation
export function useAdjustStock() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { quantity: number; reason: string } }) =>
      inventoryService.adjustStock(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.item(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.items() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lowStock() });
      toast.success('Stock adjusted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to adjust stock: ${error.message}`);
    },
  });
}
