import { LocalNotifications } from '@capacitor/local-notifications';
import type { Note } from '../types';

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
  // Initialize notification service and request permissions
  static async initialize(): Promise<boolean> {
    try {
      console.log('Initializing notification service...');
      
      // Request permissions
      const result = await LocalNotifications.requestPermissions();
      console.log('Notification permissions result:', result);
      
      if (result.display !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Create notification channels
      await this.createNotificationChannels();
      
      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  // Create notification channels for Android
  static async createNotificationChannels(): Promise<void> {
    try {
      await LocalNotifications.createChannel({
        id: 'note_reminders',
        name: 'Note Reminders',
        description: 'Reminders for your financial notes',
        sound: 'default',
        importance: 4, // High importance
        visibility: 1, // Public
        lights: true,
        vibration: true
      });

      await LocalNotifications.createChannel({
        id: 'budget_alerts',
        name: 'Budget Alerts',
        description: 'Alerts when you exceed your budget',
        sound: 'default',
        importance: 4, // High importance
        visibility: 1, // Public
        lights: true,
        vibration: true
      });

      console.log('Notification channels created successfully');
    } catch (error) {
      console.error('Failed to create notification channels:', error);
    }
  }

  // Schedule a note reminder with optional recurring schedule
  static async scheduleNoteReminder(note: Note): Promise<number | null> {
    try {
      if (!note.reminderAt) return null;

      console.log('Scheduling reminder for note:', {
        id: note.id,
        content: note.content.substring(0, 50),
        reminderAt: note.reminderAt,
        isRecurring: note.isRecurring,
        recurringType: note.recurringType
      });

      const notificationId = Date.now() + Math.floor(Math.random() * 1000);
      const reminderDate = new Date(note.reminderAt);

      // Check if the reminder date is in the future
      if (reminderDate <= new Date()) {
        console.warn('Reminder date is in the past, adjusting to next occurrence');
        if (note.isRecurring && note.recurringType) {
          const nextDate = this.getNextRecurringDate(reminderDate, note.recurringType, note.recurringDay);
          if (nextDate) {
            reminderDate.setTime(nextDate.getTime());
          }
        } else {
          console.error('Cannot schedule reminder for past date');
          return null;
        }
      }

      if (note.isRecurring && note.recurringType) {
        await this.scheduleRecurringReminder(note, notificationId, reminderDate);
      } else {
        await this.scheduleSingleReminder(note, notificationId, reminderDate);
      }

      console.log('Reminder scheduled successfully with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling note reminder:', error);
      return null;
    }
  }

  // Schedule a single (non-recurring) reminder
  private static async scheduleSingleReminder(note: Note, notificationId: number, reminderDate: Date): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: 'Financial Note Reminder',
          body: note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content,
          sound: 'default',
          actionTypeId: 'OPEN_APP',
          channelId: 'note_reminders',
          schedule: {
            at: reminderDate
          },
          extra: {
            type: 'note_reminder',
            noteId: note.id
          }
        }
      ]
    });
  }

  // Schedule recurring reminders
  private static async scheduleRecurringReminder(note: Note, notificationId: number, startDate: Date): Promise<void> {
    const schedules = this.generateRecurringSchedules(note, startDate);
    
    for (let i = 0; i < schedules.length; i++) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId + i,
            title: 'Financial Note Reminder',
            body: note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content,
            sound: 'default',
            actionTypeId: 'OPEN_APP',
            channelId: 'note_reminders',
            schedule: {
              at: schedules[i]
            },
            extra: {
              type: 'note_reminder',
              noteId: note.id,
              isRecurring: true,
              recurringType: note.recurringType
            }
          }
        ]
      });
    }
  }

  // Get the next occurrence date for recurring reminders
  private static getNextRecurringDate(baseDate: Date, recurringType: string, recurringDay?: number | null): Date | null {
    const now = new Date();
    const nextDate = new Date(baseDate);
    
    switch (recurringType) {
      case 'daily':
        // If the time has passed today, schedule for tomorrow
        if (nextDate <= now) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        break;
        
      case 'weekly':
        const targetDay = recurringDay || 1; // Default to Monday
        const currentDay = nextDate.getDay();
        let daysUntilTarget = targetDay - currentDay;
        
        if (daysUntilTarget <= 0 || nextDate <= now) {
          daysUntilTarget += 7; // Next week
        }
        
        nextDate.setDate(nextDate.getDate() + daysUntilTarget);
        break;
        
      case 'monthly':
        const targetDate = recurringDay || 1;
        nextDate.setDate(targetDate);
        
        // If the date has passed this month, go to next month
        if (nextDate <= now) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        break;
        
      case 'yearly':
        // If the date has passed this year, go to next year
        if (nextDate <= now) {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
        break;
        
      default:
        return null;
    }
    
    return nextDate;
  }

  // Generate multiple notification schedules for recurring reminders
  private static generateRecurringSchedules(note: Note, startDate: Date): Date[] {
    const schedules: Date[] = [];
    const now = new Date();
    const maxSchedules = 52; // Schedule up to 52 occurrences (1 year for weekly)

    for (let i = 0; i < maxSchedules; i++) {
      let nextDate: Date;

      switch (note.recurringType) {
        case 'daily':
          nextDate = new Date(startDate);
          nextDate.setDate(startDate.getDate() + i);
          break;

        case 'weekly':
          nextDate = new Date(startDate);
          nextDate.setDate(startDate.getDate() + (i * 7));
          break;

        case 'monthly':
          nextDate = new Date(startDate);
          nextDate.setMonth(startDate.getMonth() + i);
          break;

        case 'yearly':
          nextDate = new Date(startDate);
          nextDate.setFullYear(startDate.getFullYear() + i);
          break;

        default:
          return [];
      }

      // Only schedule future notifications
      if (nextDate > now) {
        schedules.push(nextDate);
      }
    }

    return schedules;
  }

  // Cancel all notifications for a note
  static async cancelNoteReminder(notificationIds: number[]): Promise<void> {
    try {
      if (notificationIds.length > 0) {
        await LocalNotifications.cancel({
          notifications: notificationIds.map(id => ({ id }))
        });
      }
    } catch (error) {
      console.error('Error canceling note reminder:', error);
    }
  }

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
} 