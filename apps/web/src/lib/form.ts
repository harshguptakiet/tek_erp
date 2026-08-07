import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';
import type { ZodTypeAny } from 'zod';

/** Typed zod resolver wrapper for react-hook-form + zod v4 compatibility */
export function formResolver<T extends FieldValues>(schema: ZodTypeAny): Resolver<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return zodResolver(schema as any) as Resolver<T>;
}
