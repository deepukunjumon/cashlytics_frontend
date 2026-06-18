import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ColorPalette } from '@/components/ColorPalette';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAccount } from '@/api/accounts';
import { getErrorMessage } from '@/lib/utils';
import type { Account, AccountType } from '@/types';

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'cash',            label: 'Cash' },
  { value: 'credit_card',     label: 'Credit Card' },
  { value: 'savings_account', label: 'Savings Account' },
  { value: 'investments',     label: 'Investments' },
  { value: 'other',           label: 'Other' },
];

const addAccountSchema = z.object({
  name:    z.string().min(1, 'Account name is required').max(255, 'Name is too long'),
  type:    z.enum(['cash', 'credit_card', 'savings_account', 'investments', 'other']),
  balance: z
    .string()
    .min(1, 'Balance is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid amount'),
});

type AddAccountFormValues = z.infer<typeof addAccountSchema>;

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (account: Account) => void;
}

export function AddAccountDialog({ open, onOpenChange, onCreated }: AddAccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [color, setColor] = useState('');

  const form = useForm<AddAccountFormValues>({
    resolver: zodResolver(addAccountSchema),
    defaultValues: { name: '', type: 'cash', balance: '0' },
  });

  async function onSubmit(values: AddAccountFormValues) {
    setIsSubmitting(true);
    try {
      const account = await createAccount({
        name:    values.name,
        type:    values.type,
        balance: Number(values.balance),
        color:   color || undefined,
      });
      toast.success('Account added successfully.');
      onCreated(account);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) { form.reset(); setColor(''); }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add account</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HDFC Savings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Color <span className="text-muted-foreground">(optional)</span></p>
              <ColorPalette value={color} onChange={(c) => setColor(color === c ? '' : c)} />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Adding…' : 'Add account'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
