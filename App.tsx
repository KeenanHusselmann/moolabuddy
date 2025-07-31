
import React, { useState, useMemo, useEffect } from 'react';
import type { View, Transaction, Goal, Note, Projection, UserProfile, Budget, ArchiveItem, CostItem } from './types';
import { TransactionType } from './types';
import * as XLSX from 'xlsx';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Goals from './components/Goals';
import Projections from './components/Projections';
import Notes from './components/Notes';
import Resources from './components/Resources';
import Profile from './components/Profile';
import History from './components/History';
import Tools from './components/Tools';
import ShoppingListComponent from './components/ShoppingList';
import ReceiptsComponent from './components/Receipts';
import StoresComponent from './components/Stores';
import AIAdvisor from './components/AIAdvisor';
import LandingPage from './components/LandingPage';
import BottomNav from './components/BottomNav';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapacitorApp } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * A custom hook to manage state that persists in localStorage.
 * @param defaultValue The default value if nothing is in localStorage.
 * @param key The key for localStorage.
 * @returns A state and a setter function, similar to useState.
 */
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null
        ? JSON.parse(stickyValue)
        : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error)      {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [navigationStack, setNavigationStack] = useState<View[]>(['Dashboard']);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);

  const [transactions, setTransactions] = useStickyState<Transaction[]>([], 'moolabuddy_transactions');
  const [goals, setGoals] = useStickyState<Goal[]>([], 'moolabuddy_goals');
  const [notes, setNotes] = useStickyState<Note[]>([], 'moolabuddy_notes');
  const [projections, setProjections] = useStickyState<Projection[]>([], 'moolabuddy_projections');
  const [profile, setProfile] = useStickyState<UserProfile>({ name: 'MoolaBuddy User', motto: 'Your Smart Finance Buddy' }, 'moolabuddy_profile');
  const [budgets, setBudgets] = useStickyState<Budget[]>([], 'moolabuddy_budgets');
  const [costs, setCosts] = useStickyState<CostItem[]>([], 'moolabuddy_costs');
  const [archive, setArchive] = useStickyState<ArchiveItem[]>([], 'moolabuddy_archive');
  const [incomeForTool, setIncomeForTool] = useStickyState<string>('', 'moolabuddy_income_for_tool');
  const [shoppingLists, setShoppingLists] = useStickyState<any[]>([], 'moolabuddy_shopping_lists');
  const [receipts, setReceipts] = useStickyState<any[]>([], 'moolabuddy_receipts');
  const [stores, setStores] = useStickyState<any[]>([], 'moolabuddy_stores');


  // Navigation and History Management
  const navigateTo = (view: View) => {
    setActiveView(view);
    setNavigationStack(prev => [...prev, view]);
    setSidebarOpen(false); // Always close sidebar on navigation
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      const newStack = navigationStack.slice(0, -1);
      const previousView = newStack[newStack.length - 1];
      setNavigationStack(newStack);
      setActiveView(previousView);
    }
  };

  const handleLandingPageComplete = () => {
    setShowLandingPage(false);
  };

  // Handle Android back button
  useEffect(() => {
    const handleBackButton = () => {
      if (isSidebarOpen) {
        setSidebarOpen(false);
        return true; // Prevent default back behavior
      }
      
      if (navigationStack.length > 1) {
        goBack();
        return true; // Prevent default back behavior
      }
      
      // If we're on Dashboard and no navigation stack, allow app to close
      if (activeView === 'Dashboard') {
        return false; // Allow default back behavior (exit app)
      }
      
      return false; // Allow default back behavior (exit app)
    };

    // Set up Capacitor back button listener
    const setupBackButtonListener = async () => {
      const backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (isSidebarOpen) {
          setSidebarOpen(false);
          return;
        }
        
        if (navigationStack.length > 1) {
          goBack();
          return;
        }
        
        // If we're on Dashboard and no navigation stack, exit the app
        if (activeView === 'Dashboard') {
          CapacitorApp.exitApp();
          return;
        }
      });

      return backButtonListener;
    };

    let backButtonListener: any = null;

    setupBackButtonListener().then(listener => {
      backButtonListener = listener;
    });

    // Handle browser back button
    const handlePopState = (event: PopStateEvent) => {
      if (navigationStack.length > 1) {
        goBack();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigationStack, isSidebarOpen, activeView]);

  // Handle notification taps and setup
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Request permissions on app start
        let permissions = await LocalNotifications.checkPermissions();
        if (permissions.display !== 'granted') {
          permissions = await LocalNotifications.requestPermissions();
          console.log('Notification permissions:', permissions);
        }

        // Create notification channel for Android 8.0+
        try {
          await LocalNotifications.createChannel({
            id: 'moolabuddy-reminders',
            name: 'MoolaBuddy Reminders',
            description: 'Financial reminder notifications',
            importance: 4, // High importance
            visibility: 1, // Public visibility
            sound: 'default',
            lights: true,
            vibration: true
          });
          console.log('Notification channel created');
        } catch (e) {
          console.log('Notification channel already exists or error:', e);
        }

        // Setup notification listener for when user taps notification
        await LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
          console.log('Notification tapped:', notificationAction);
          
          // Check if this is a note reminder notification
          if (notificationAction.notification.extra?.type === 'note_reminder') {
            console.log('Note reminder notification tapped, navigating to Notes page');
            
            // Add a small delay to ensure app is fully loaded
            setTimeout(() => {
              console.log('Navigating to Notes page from notification');
              navigateTo('Notes');
            }, 1000);
          }
        });

        // Setup notification received listener (when notification appears)
        await LocalNotifications.addListener('localNotificationReceived', (notification) => {
          console.log('Notification received:', notification);
        });

        // Setup app state change listener to handle app opening from notification
        await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            console.log('App became active - checking if opened from notification');
            // You could add logic here to check if app was opened from notification
          }
        });

        console.log('Notification system initialized');
      } catch (e) {
        console.error('Error setting up notification system:', e);
      }
    };

    setupNotifications();
  }, []);
  
  // Notification Management
  const scheduleNotification = async (note: Note) => {
    try {
        if (!note.reminderAt || !note.notificationId) {
            console.log('Missing reminderAt or notificationId:', { reminderAt: note.reminderAt, notificationId: note.notificationId });
            return;
        }

        let permissions = await LocalNotifications.checkPermissions();
        if (permissions.display !== 'granted') {
            permissions = await LocalNotifications.requestPermissions();
        }

        if (permissions.display === 'granted') {
            const reminderDate = new Date(note.reminderAt);
            const now = new Date();
            
            console.log('Scheduling notification:', {
                reminderDate: reminderDate.toLocaleString(),
                now: now.toLocaleString(),
                isFuture: reminderDate > now
            });
            
            // Only schedule if the reminder is in the future
            if (reminderDate > now) {
                // Test immediate notification first
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "MoolaBuddy Test",
                            body: "Testing notification system...",
                            id: 999999,
                            channelId: 'moolabuddy-reminders',
                            schedule: { 
                                at: new Date(Date.now() + 5000), // 5 seconds from now
                                allowWhileIdle: true,
                                repeats: false
                            },
                            sound: 'default',
                            actionTypeId: 'OPEN_APP',
                            extra: {
                                type: 'test',
                                action: 'test'
                            }
                        }
                    ]
                });
                console.log('✅ Test notification scheduled for 5 seconds from now');

                // Schedule the actual notification
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "MoolaBuddy Reminder",
                            body: note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content,
                            id: note.notificationId,
                            channelId: 'moolabuddy-reminders',
                            schedule: { 
                                at: reminderDate,
                                allowWhileIdle: true,
                                repeats: false
                            },
                            sound: 'default',
                            actionTypeId: 'OPEN_APP',
                            extra: {
                                noteId: note.id,
                                type: 'note_reminder',
                                action: 'open_notes'
                            }
                        }
                    ]
                });
                console.log(`✅ Notification scheduled for ${reminderDate.toLocaleString()} with ID: ${note.notificationId}`);
            } else {
                console.log('❌ Reminder time is in the past, not scheduling');
            }
        } else {
            console.log('❌ Notification permissions not granted');
        }
    } catch (e) {
        console.error("❌ Error scheduling notification", e);
    }
  };

  const cancelNotification = async (notificationId: number) => {
      try {
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      } catch(e) {
        console.error("Error canceling notification", e);
      }
  };


  // Archive Management
  const archiveItem = (item: Transaction | Goal | Note | Projection | Budget | CostItem, type: ArchiveItem['type']) => {
      const newArchiveItem: ArchiveItem = {
          id: crypto.randomUUID(),
          type,
          data: item,
          deletedAt: new Date().toISOString()
      };
      setArchive(prev => [newArchiveItem, ...prev]);
  };

  const restoreItem = (itemToRestore: ArchiveItem) => {
    switch (itemToRestore.type) {
      case 'Transaction':
        setTransactions(prev => [...prev, itemToRestore.data as Transaction]);
        break;
      case 'Goal':
        setGoals(prev => [...prev, itemToRestore.data as Goal]);
        break;
      case 'Note':
        const noteToRestore = itemToRestore.data as Note;
        if(noteToRestore.reminderAt && noteToRestore.notificationId) {
            scheduleNotification(noteToRestore);
        }
        setNotes(prev => [...prev, noteToRestore]);
        break;
      case 'Projection':
        setProjections(prev => [...prev, itemToRestore.data as Projection]);
        break;
      case 'Budget':
          setBudgets(prev => [...prev, itemToRestore.data as Budget]);
          break;
      case 'Cost':
          setCosts(prev => [...prev, itemToRestore.data as CostItem]);
          break;
    }
    setArchive(prev => prev.filter(item => item.id !== itemToRestore.id));
  };

  const permanentlyDeleteItem = (idToDelete: string) => {
      setArchive(prev => prev.filter(item => item.id !== idToDelete));
  };


  // Transaction Management
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(currentTransactions => 
        currentTransactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };
  
  const deleteTransaction = (idToDelete: string) => {
    const itemToArchive = transactions.find(t => t.id === idToDelete);
    if(itemToArchive) archiveItem(itemToArchive, 'Transaction');
    setTransactions(currentTransactions => 
      currentTransactions.filter(transaction => transaction.id !== idToDelete)
    );
  };

  // Goal Management
  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount'>) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      currentAmount: 0,
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals(currentGoals => 
        currentGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
    );
  };
  
  const deleteGoal = (idToDelete: string) => {
    const itemToArchive = goals.find(g => g.id === idToDelete);
    if(itemToArchive) archiveItem(itemToArchive, 'Goal');
    setGoals(currentGoals => 
      currentGoals.filter(goal => goal.id !== idToDelete)
    );
  };
  
  // Note Management
  const saveNote = (noteData: { content: string; reminderAt: string | null; }) => {
    if (!noteData.content.trim()) return;
    
    // Generate unique notification ID
    const notificationId = noteData.reminderAt ? Math.floor(Math.random() * 1000000) + 1 : undefined;
    
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: noteData.content,
      createdAt: new Date().toISOString(),
      reminderAt: noteData.reminderAt,
      notificationId: notificationId
    };
    
    console.log('Creating new note:', {
      content: noteData.content,
      reminderAt: noteData.reminderAt,
      notificationId: notificationId
    });
    
    if (newNote.reminderAt && newNote.notificationId) {
        scheduleNotification(newNote);
    }
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, newContent: string, newReminderAt: string | null) => {
    setNotes(currentNotes => 
        currentNotes.map(note => {
            if (note.id === id) {
                const oldNotificationId = note.notificationId;
                if (oldNotificationId) {
                    cancelNotification(oldNotificationId);
                }
                
                // Generate new notification ID if reminder is set
                const newNotificationId = newReminderAt ? Math.floor(Math.random() * 1000000) + 1 : null;
                
                const updatedNote = { 
                    ...note, 
                    content: newContent, 
                    reminderAt: newReminderAt, 
                    notificationId: newNotificationId 
                };
                
                console.log('Updating note:', {
                    id: note.id,
                    newContent: newContent,
                    newReminderAt: newReminderAt,
                    newNotificationId: newNotificationId
                });
                
                if (updatedNote.reminderAt && updatedNote.notificationId) {
                    scheduleNotification(updatedNote);
                }
                return updatedNote;
            }
            return note;
        })
    );
  };

  const deleteNote = (idToDelete: string) => {
    const itemToArchive = notes.find(n => n.id === idToDelete);
    if (itemToArchive) {
        if(itemToArchive.notificationId) {
            cancelNotification(itemToArchive.notificationId);
        }
        archiveItem(itemToArchive, 'Note');
    }
    setNotes(currentNotes => 
      currentNotes.filter(note => note.id !== idToDelete)
    );
  };

  // Projection Management
  const addProjection = (projection: Omit<Projection, 'id' | 'createdAt'>) => {
    const newProjection: Projection = {
        ...projection,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    setProjections(prev => [newProjection, ...prev]);
  };
  
  const updateProjection = (updatedProjection: Projection) => {
    setProjections(currentProjections =>
        currentProjections.map(p => p.id === updatedProjection.id ? updatedProjection : p)
    );
  };
  
  const deleteProjection = (idToDelete: string) => {
    const itemToArchive = projections.find(p => p.id === idToDelete);
    if(itemToArchive) archiveItem(itemToArchive, 'Projection');
    setProjections(currentProjections => 
        currentProjections.filter(p => p.id !== idToDelete)
    );
  };

  // Budget Management
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = { ...budget, id: crypto.randomUUID() };
    setBudgets(prev => [...prev, newBudget]);
  };

  const deleteBudget = (idToDelete: string) => {
    const itemToArchive = budgets.find(b => b.id === idToDelete);
    if(itemToArchive) archiveItem(itemToArchive, 'Budget');
    setBudgets(currentBudgets => 
      currentBudgets.filter(b => b.id !== idToDelete)
    );
  };
  
  // Cost Management
  const addCost = (cost: Omit<CostItem, 'id'>) => {
    const newCost: CostItem = { ...cost, id: crypto.randomUUID() };
    setCosts(prev => [...prev, newCost]);
  };

  const deleteCost = (idToDelete: string) => {
    const itemToArchive = costs.find(c => c.id === idToDelete);
    if(itemToArchive) archiveItem(itemToArchive, 'Cost');
    setCosts(currentCosts => 
      currentCosts.filter(c => c.id !== idToDelete)
    );
  };

  // Data Management
  const resetAllData = () => {
    setTransactions([]);
    setGoals([]);
    notes.forEach(note => {
        if(note.notificationId) cancelNotification(note.notificationId);
    });
    setNotes([]);
    setProjections([]);
    setBudgets([]);
    setCosts([]);
    setArchive([]);
    setIncomeForTool('');
    setProfile({ name: 'MoolaBuddy User', motto: 'Your Smart Finance Buddy' });
    window.history.replaceState({ view: 'Dashboard' }, '');
    setActiveView('Dashboard');
  };

    const exportData = async () => {
      const exportDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Prepare data for different sheets
      const transactionsData = transactions.map(t => ({
          'Date': new Date(t.date).toLocaleDateString(),
          'Type': t.type,
          'Description': t.description,
          'Amount': t.amount,
          'Category': t.category || 'Other'
      }));

      const goalsData = goals.map(g => ({
          'Name': g.name,
          'Target Amount': g.targetAmount,
          'Current Amount': g.currentAmount,
          'Progress': `${((g.currentAmount / g.targetAmount) * 100).toFixed(1)}%`,
          'Deadline': g.deadline ? new Date(g.deadline).toLocaleDateString() : 'No deadline'
      }));

      const notesData = notes.map(n => ({
          'Content': n.content,
          'Created': new Date(n.createdAt).toLocaleDateString(),
          'Reminder': n.reminderAt ? new Date(n.reminderAt).toLocaleDateString() : 'No reminder'
      }));

      const projectionsData = projections.map(p => ({
          'Name': p.name,
          'Initial Investment': p.initialInvestment,
          'Monthly Contribution': p.monthlyContribution,
          'Annual Rate': p.annualRate,
          'Years': p.years,
          'Created': new Date(p.createdAt).toLocaleDateString()
      }));

      const budgetsData = budgets.map(b => ({
          'Category': b.category,
          'Limit': b.limit,
          'Spent': 0, // Budget doesn't have spent property
          'Remaining': b.limit,
          'Progress': '0%'
      }));

      const costsData = costs.map(c => ({
          'Name': c.name,
          'Amount': c.amount,
          'Type': c.type
      }));

      // Create worksheets
      const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
      const goalsSheet = XLSX.utils.json_to_sheet(goalsData);
      const notesSheet = XLSX.utils.json_to_sheet(notesData);
      const projectionsSheet = XLSX.utils.json_to_sheet(projectionsData);
      const budgetsSheet = XLSX.utils.json_to_sheet(budgetsData);
      const costsSheet = XLSX.utils.json_to_sheet(costsData);

      // Add worksheets to workbook
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');
      XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Goals');
      XLSX.utils.book_append_sheet(workbook, notesSheet, 'Notes');
      XLSX.utils.book_append_sheet(workbook, projectionsSheet, 'Projections');
      XLSX.utils.book_append_sheet(workbook, budgetsSheet, 'Budgets');
      XLSX.utils.book_append_sheet(workbook, costsSheet, 'Costs');

      // Create summary sheet
      const summaryData = [
          { 'Metric': 'Total Transactions', 'Value': transactions.length },
          { 'Metric': 'Total Goals', 'Value': goals.length },
          { 'Metric': 'Total Notes', 'Value': notes.length },
          { 'Metric': 'Total Projections', 'Value': projections.length },
          { 'Metric': 'Total Budgets', 'Value': budgets.length },
          { 'Metric': 'Total Costs', 'Value': costs.length },
          { 'Metric': 'Total Income', 'Value': transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0) },
          { 'Metric': 'Total Expenses', 'Value': transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0) },
          { 'Metric': 'Export Date', 'Value': exportDate }
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Generate filename
      const filename = `moolabuddy_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      try {
          // Convert workbook to base64
          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
          
          // Write file to device storage
          const result = await Filesystem.writeFile({
              path: filename,
              data: excelBuffer,
              directory: Directory.Documents,
              recursive: true
          });

          console.log('File saved to:', result.uri);

          // Show success notification
          await LocalNotifications.schedule({
              notifications: [
                  {
                      title: "📊 Data Export Complete",
                      body: `Excel file saved to Documents folder: ${filename}`,
                      id: Math.floor(Math.random() * 1000000) + 1,
                      channelId: 'moolabuddy-reminders',
                      sound: 'default',
                      actionTypeId: 'OPEN_APP',
                      extra: {
                          type: 'export_complete',
                          filename: filename,
                          filepath: result.uri
                      }
                  }
              ]
          });

          // Also show alert for immediate feedback
          alert(`✅ Data exported successfully!\n\nFile saved as: ${filename}\nLocation: Documents folder\n\nYour Excel file contains:\n• Transactions\n• Goals\n• Notes\n• Projections\n• Budgets\n• Costs\n• Summary`);
      } catch (error) {
          console.error('Export error:', error);
          alert('❌ Export failed. Please try again or check your device storage.');
      }
  };

  const financialData = useMemo(() => ({
    transactions,
    goals,
    income: transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0),
    expenses: transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0),
  }), [transactions, goals]);

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard financialData={financialData} costs={costs} />;
      case 'Transactions':
        return <Transactions 
                    transactions={transactions} 
                    addTransaction={addTransaction}
                    updateTransaction={updateTransaction}
                    deleteTransaction={deleteTransaction} 
                />;
      case 'Goals':
        return <Goals goals={goals} addGoal={addGoal} updateGoal={updateGoal} deleteGoal={deleteGoal} />;
      case 'Projections':
        return <Projections 
                  projections={projections} 
                  addProjection={addProjection}
                  updateProjection={updateProjection}
                  deleteProjection={deleteProjection}
               />;
      case 'Notes':
        return <Notes notes={notes} saveNote={saveNote} deleteNote={deleteNote} updateNote={updateNote} />;
      case 'Resources':
        return <Resources />;
      case 'Tools':
        return <Tools 
                  costs={costs} 
                  addCost={addCost} 
                  deleteCost={deleteCost} 
                  income={incomeForTool} 
                  setIncome={setIncomeForTool}
               />;
      case 'History':
        return <History 
                  archive={archive} 
                  restoreItem={restoreItem} 
                  permanentlyDeleteItem={permanentlyDeleteItem} 
               />;
      case 'Profile':
        return <Profile
                  profile={profile}
                  setProfile={setProfile}
                  budgets={budgets}
                  addBudget={addBudget}
                  deleteBudget={deleteBudget}
                  transactions={transactions}
                  exportData={exportData}
                  resetAllData={resetAllData}
                />;
      case 'ShoppingList':
        return <ShoppingListComponent
                  shoppingLists={shoppingLists}
                  setShoppingLists={setShoppingLists}
                  budgets={budgets}
                  setBudgets={setBudgets}
                  addTransaction={addTransaction}
                  goBack={goBack}
                />;
      case 'Receipts':
        return <ReceiptsComponent
                  receipts={receipts}
                  setReceipts={setReceipts}
                  addTransaction={addTransaction}
                  goBack={goBack}
                  stores={stores}
                  setStores={setStores}
                />;
      case 'Stores':
        return <StoresComponent
                  stores={stores}
                  setStores={setStores}
                  transactions={transactions}
                />;
      case 'AIAdvisor':
        return <AIAdvisor financialData={financialData} />;
      default:
        return <Dashboard financialData={financialData} costs={costs} />;
    }
  };

  // Show landing page first
  if (showLandingPage) {
    return <LandingPage onComplete={handleLandingPageComplete} />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-200 safe-area-inset">
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-20 lg:hidden"></div>}
      <Sidebar 
        activeView={activeView} 
        navigateTo={navigateTo} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={activeView} 
          onMenuClick={() => setSidebarOpen(true)} 
          onBackClick={goBack}
          canGoBack={navigationStack.length > 1}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-3 sm:p-4 md:p-6 pb-20">
          {renderView()}
        </main>
        <Footer />
      </div>
      <BottomNav activeView={activeView} navigateTo={navigateTo} />
    </div>
  );
};

export default App;
