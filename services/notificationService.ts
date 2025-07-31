import { LocalNotifications } from '@capacitor/local-notifications';

export interface BudgetAlert {
  category: string;
  limit: number;
  spent: number;
  overspent: number;
}

export interface SavingsAlert {
  currentRate: number;
  targetRate: number;
  income: number;
  savings: number;
}

export class NotificationService {
  static async checkBudgetAlerts(transactions: any[], budgets: any[]): Promise<void> {
    try {
      const alerts: BudgetAlert[] = [];
      
      // Check each budget for overruns
      for (const budget of budgets) {
        const spent = transactions
          .filter(t => t.type === 'EXPENSE' && t.category.toLowerCase() === budget.category.toLowerCase())
          .reduce((sum, t) => sum + t.amount, 0);
        
        if (spent > budget.limit) {
          alerts.push({
            category: budget.category,
            limit: budget.limit,
            spent: spent,
            overspent: spent - budget.limit
          });
        }
      }
      
      // Send notifications for each alert
      for (const alert of alerts) {
        await this.sendBudgetAlert(alert);
      }
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }
  }
  
  static async checkSavingsAlert(income: number, savings: number): Promise<void> {
    try {
      const savingsRate = (savings / income) * 100;
      const targetRate = 10; // 10% target
      
      if (savingsRate < targetRate) {
        await this.sendSavingsAlert({
          currentRate: savingsRate,
          targetRate: targetRate,
          income: income,
          savings: savings
        });
      }
    } catch (error) {
      console.error('Error checking savings alert:', error);
    }
  }
  
  private static async sendBudgetAlert(alert: BudgetAlert): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: 'Budget Alert!',
            body: `You've exceeded your ${alert.category} budget by N$${alert.overspent.toFixed(2)}. You spent N$${alert.spent.toFixed(2)} but your limit was N$${alert.limit.toFixed(2)}.`,
            sound: 'default',
            actionTypeId: 'OPEN_APP',
            channelId: 'budget_alerts',
            extra: {
              type: 'budget_alert',
              category: alert.category,
              overspent: alert.overspent
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error sending budget alert:', error);
    }
  }
  
  private static async sendSavingsAlert(alert: SavingsAlert): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now() + 1,
            title: 'Savings Alert!',
            body: `Your savings rate is ${alert.currentRate.toFixed(1)}%. You saved N$${alert.savings.toFixed(2)} from N$${alert.income.toFixed(2)} income. Aim for at least ${alert.targetRate}%.`,
            sound: 'default',
            actionTypeId: 'OPEN_APP',
            channelId: 'savings_alerts',
            extra: {
              type: 'savings_alert',
              currentRate: alert.currentRate,
              targetRate: alert.targetRate
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error sending savings alert:', error);
    }
  }
  
  static async requestPermissions(): Promise<void> {
    try {
      await LocalNotifications.requestPermissions();
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  }
  
  static async initializeNotifications(): Promise<void> {
    try {
      await this.requestPermissions();
      
      // Create notification channels for Android
      await LocalNotifications.createChannel({
        id: 'budget_alerts',
        name: 'Budget Alerts',
        description: 'Notifications for budget overruns',
        importance: 4, // High importance
        visibility: 1, // Public
        sound: 'default'
      });
      
      await LocalNotifications.createChannel({
        id: 'savings_alerts',
        name: 'Savings Alerts',
        description: 'Notifications for savings rate alerts',
        importance: 3, // Default importance
        visibility: 1, // Public
        sound: 'default'
      });
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }
} 