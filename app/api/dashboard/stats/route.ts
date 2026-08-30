import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import User from '@/models/User';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format, eachDayOfInterval } from 'date-fns';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    await dbConnect();

    // Get user with budget
    const user = await User.findById(userId);
    const monthlyBudget = user?.preferences?.monthlyBudget || 0;

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subDays(now, 30));
    const lastMonthEnd = endOfMonth(subDays(now, 30));

    // Get today's expenses
    const todayExpenses = await Expense.find({
      user: userId,
      date: { $gte: todayStart, $lte: todayEnd },
    }).sort({ date: -1 }).lean();

    // Get this month's expenses
    const monthlyExpenses = await Expense.find({
      user: userId,
      date: { $gte: monthStart, $lte: monthEnd },
    }).lean();

    // Get last month's expenses for comparison
    const lastMonthExpenses = await Expense.find({
      user: userId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
    }).lean();

    // Calculate totals
    const spent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const todayCount = todayExpenses.length;
    const remaining = monthlyBudget - spent;
    const budgetPercentage = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;

    // Calculate previous month spent
    const previousMonthSpent = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const changePercentage = previousMonthSpent > 0 
      ? ((spent - previousMonthSpent) / previousMonthSpent) * 100 
      : 0;

    // Calculate category breakdown
    const categoryMap = new Map();
    monthlyExpenses.forEach(exp => {
      const category = exp.category || 'Other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, count: 0 });
      }
      const current = categoryMap.get(category);
      current.total += exp.amount;
      current.count += 1;
      categoryMap.set(category, current);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        percentage: spent > 0 ? (data.total / spent) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Calculate weekly trend (last 7 days)
    const weekDays = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    });

    const weeklyTrend = await Promise.all(weekDays.map(async (day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const dayExpenses = await Expense.find({
        user: userId,
        date: { $gte: dayStart, $lte: dayEnd },
      });
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        day: format(day, 'EEE'),
        total,
      };
    }));

    return NextResponse.json({
      budget: monthlyBudget,
      spent,
      remaining,
      todayTotal,
      todayCount,
      todayExpenses,
      categoryBreakdown,
      budgetPercentage,
      monthName: format(now, 'MMMM yyyy'),
      weeklyTrend,
      previousMonthSpent,
      changePercentage,
    });

  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}