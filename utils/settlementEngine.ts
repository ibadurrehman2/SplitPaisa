
import { Expense, Settlement, User } from '../types';

export interface SimplifiedDebt {
  from: string;
  to: string;
  amount: number;
}

/**
 * Calculates net balances for each user based on expenses and settlements
 */
export function calculateNetBalances(
  users: User[],
  expenses: Expense[],
  settlements: Settlement[],
  groupId?: string
): Record<string, number> {
  const balances: Record<string, number> = {};
  users.forEach(u => (balances[u.id] = 0));

  // Filter by group if needed
  const relevantExpenses = groupId ? expenses.filter(e => e.groupId === groupId) : expenses;
  const relevantSettlements = groupId ? settlements.filter(s => s.groupId === groupId) : settlements;

  relevantExpenses.forEach(exp => {
    // Payer gets back the full amount minus their own share
    const payerBalance = balances[exp.paidBy] || 0;
    balances[exp.paidBy] = payerBalance + exp.amount;

    // Each person in splits owes their split amount
    exp.splits.forEach(split => {
      balances[split.userId] = (balances[split.userId] || 0) - split.amount;
    });
  });

  relevantSettlements.forEach(set => {
    // Settler pays: balance increases (less debt)
    balances[set.from] = (balances[set.from] || 0) + set.amount;
    // Receiver gets: balance decreases (less owed)
    balances[set.to] = (balances[set.to] || 0) - set.amount;
  });

  return balances;
}

/**
 * Greedy algorithm to simplify debts by matching biggest debtors with biggest creditors
 */
export function simplifyDebts(netBalances: Record<string, number>): SimplifiedDebt[] {
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  Object.entries(netBalances).forEach(([id, amount]) => {
    if (amount < -0.01) {
      debtors.push({ id, amount: Math.abs(amount) });
    } else if (amount > 0.01) {
      creditors.push({ id, amount });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const debts: SimplifiedDebt[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    debts.push({
      from: debtors[i].id,
      to: creditors[j].id,
      amount: Math.round(amount * 100) / 100
    });

    debtors[i].amount -= amount;
    creditors[j].amount -= amount;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return debts;
}
