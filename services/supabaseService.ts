import { supabase } from '@/lib/supabase';
import { Customer, Plan, Subscription, Payment } from './interface/types';

// ─── Helpers de mapeamento (snake_case → camelCase) ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  email: row.email,
  status: row.status,
  notes: row.notes ?? '',
  createdAt: row.created_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPlan = (row: any): Plan => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
  active: row.active,
  createdAt: row.created_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapSubscription = (row: any): Subscription => ({
  id: row.id,
  customerId: row.customer_id,
  planId: row.plan_id,
  startDate: row.start_date,
  nextRenewal: row.next_renewal,
  status: row.status,
  createdAt: row.created_at,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapPayment = (row: any): Payment => ({
  id: row.id,
  subscriptionId: row.subscription_id,
  amount: Number(row.amount),
  paidAt: row.paid_at,
  createdAt: row.created_at,
});

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────

export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCustomer);
};

export const createCustomer = async (
  data: Omit<Customer, 'id' | 'createdAt'>
): Promise<Customer> => {
  const { data: row, error } = await supabase
    .from('customers')
    .insert({
      name: data.name,
      email: data.email,
      status: data.status,
      notes: data.notes,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapCustomer(row);
};

export const updateCustomer = async (
  id: string,
  data: Partial<Customer>
): Promise<Customer> => {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.status !== undefined) payload.status = data.status;
  if (data.notes !== undefined) payload.notes = data.notes;

  const { data: row, error } = await supabase
    .from('customers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapCustomer(row);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── PLANS ───────────────────────────────────────────────────────────────────

export const getPlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPlan);
};

export const createPlan = async (
  data: Omit<Plan, 'id' | 'createdAt'>
): Promise<Plan> => {
  const { data: row, error } = await supabase
    .from('plans')
    .insert({
      name: data.name,
      price: data.price,
      active: data.active,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapPlan(row);
};

export const updatePlan = async (
  id: string,
  data: Partial<Plan>
): Promise<Plan> => {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.price !== undefined) payload.price = data.price;
  if (data.active !== undefined) payload.active = data.active;

  const { data: row, error } = await supabase
    .from('plans')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapPlan(row);
};

export const deletePlan = async (id: string): Promise<void> => {
  const { error } = await supabase.from('plans').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapSubscription);
};

export const createSubscription = async (
  data: Omit<Subscription, 'id' | 'createdAt'>
): Promise<Subscription> => {
  const { data: row, error } = await supabase
    .from('subscriptions')
    .insert({
      customer_id: data.customerId,
      plan_id: data.planId,
      start_date: data.startDate,
      next_renewal: data.nextRenewal,
      status: data.status,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapSubscription(row);
};

export const updateSubscription = async (
  id: string,
  data: Partial<Subscription>
): Promise<Subscription> => {
  const payload: Record<string, unknown> = {};
  if (data.customerId !== undefined) payload.customer_id = data.customerId;
  if (data.planId !== undefined) payload.plan_id = data.planId;
  if (data.startDate !== undefined) payload.start_date = data.startDate;
  if (data.nextRenewal !== undefined) payload.next_renewal = data.nextRenewal;
  if (data.status !== undefined) payload.status = data.status;

  const { data: row, error } = await supabase
    .from('subscriptions')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapSubscription(row);
};

export const deleteSubscription = async (id: string): Promise<void> => {
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export const getPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPayment);
};

export const listPaymentsBySubscription = async (
  subscriptionId: string
): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .order('paid_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPayment);
};

export const createPayment = async (
  data: Omit<Payment, 'id' | 'createdAt'>
): Promise<Payment> => {
  // 1. Inserir o pagamento
  const { data: row, error } = await supabase
    .from('payments')
    .insert({
      subscription_id: data.subscriptionId,
      amount: data.amount,
      paid_at: data.paidAt,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 2. Atualizar a assinatura: avançar 30 dias e ativar
  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('next_renewal')
    .eq('id', data.subscriptionId)
    .single();

  if (!subError && sub) {
    const currentRenewal = new Date(sub.next_renewal);
    currentRenewal.setDate(currentRenewal.getDate() + 30);
    const nextRenewalStr = currentRenewal.toISOString().split('T')[0];

    await supabase
      .from('subscriptions')
      .update({ next_renewal: nextRenewalStr, status: 'ativa' })
      .eq('id', data.subscriptionId);
  }

  return mapPayment(row);
};
