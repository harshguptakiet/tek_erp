import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceService } from '@/services/marketplace.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

// Query Keys
export const marketplaceKeys = {
  all: ['marketplace'] as const,
  products: () => [...marketplaceKeys.all, 'products'] as const,
  product: (id: string) => [...marketplaceKeys.products(), id] as const,
  myProducts: () => [...marketplaceKeys.all, 'myProducts'] as const,
  purchases: () => [...marketplaceKeys.all, 'purchases'] as const,
  sales: () => [...marketplaceKeys.all, 'sales'] as const,
};

// Fetch products (browse marketplace)
export function useMarketplaceProducts(filters?: any) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: [...marketplaceKeys.products(), filters],
    queryFn: () => marketplaceService.browseMarketplace(filters),
    enabled: !!user?.schoolId,
  });
}

// Fetch single product
export function useMarketplaceProduct(id: string) {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: marketplaceKeys.product(id),
    queryFn: () => marketplaceService.getProduct(id),
    enabled: !!user?.schoolId && !!id,
  });
}

// Fetch my products (seller view)
export function useMyProducts() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: marketplaceKeys.myProducts(),
    queryFn: () => marketplaceService.getSellerProducts(),
    enabled: !!user?.id,
  });
}

// Fetch my purchases
export function useMyPurchases() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: marketplaceKeys.purchases(),
    queryFn: () => marketplaceService.getMyPurchases(),
    enabled: !!user?.id,
  });
}

// Fetch my sales
export function useMySales() {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: marketplaceKeys.sales(),
    queryFn: () => marketplaceService.getMySales(),
    enabled: !!user?.id,
  });
}

// List product mutation
export function useListProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => marketplaceService.listProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.myProducts() });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.products() });
      toast.success('Product listed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to list product: ${error.message}`);
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      marketplaceService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.product(variables.id) });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.myProducts() });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });
}

// Purchase product mutation
export function usePurchaseProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => marketplaceService.purchaseProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.purchases() });
      toast.success('Purchase successful');
    },
    onError: (error: Error) => {
      toast.error(`Failed to purchase: ${error.message}`);
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => marketplaceService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.myProducts() });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.products() });
      toast.success('Product deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    },
  });
}
