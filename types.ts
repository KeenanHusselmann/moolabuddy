
export type View = 'Dashboard' | 'Transactions' | 'Goals' | 'Projections' | 'Notes' | 'Resources' | 'Profile' | 'History' | 'Tools' | 'ShoppingList' | 'Receipts' | 'Stores';

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  reminderAt?: string | null;
  notificationId?: number | null;
}

export interface Projection {
  id: string;
  name: string;
  initialInvestment: number;
  monthlyContribution: number;
  annualRate: number;
  years: number;
  createdAt: string;
}

export interface FinancialContent {
  videos: string[];
  articles: string[];
}

export interface UserProfile {
    name: string;
    motto: string;
}

export interface Budget {
    id: string;
    category: string;
    limit: number;
}

export interface ArchiveItem {
    id: string;
    type: 'Transaction' | 'Goal' | 'Note' | 'Projection' | 'Budget' | 'Cost';
    data: Transaction | Goal | Note | Projection | Budget | CostItem;
    deletedAt: string;
}

export interface AIInsightTip {
    type: 'savings' | 'spending' | 'investment';
    description: string;
}

export interface AIInsight {
    summary: string;
    tips: AIInsightTip[];
    observation: string;
}

export interface CostItem {
    id: string;
    name: string;
    amount: number;
    type: 'Fixed' | 'Variable';
}

export interface ShoppingItem {
    id: string;
    name: string;
    category: string;
    estimatedCost: number;
    quantity: number;
    isCompleted: boolean;
}

export interface ShoppingList {
    id: string;
    name: string;
    items: ShoppingItem[];
    totalEstimatedCost: number;
    createdAt: string;
    isSubmitted: boolean;
}

export interface Receipt {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    imageUrl: string;
    store: string;
}

export interface Store {
    id: string;
    name: string;
    category: string;
    address: string;
    phone: string;
    website: string;
    totalSpent: number;
    visitCount: number;
    lastVisit: string;
    notes: string;
    createdAt: string;
}