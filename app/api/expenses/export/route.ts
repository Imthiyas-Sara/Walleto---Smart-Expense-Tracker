import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    await dbConnect();

    const expenses = await Expense.find({ user: session.user.id })
      .sort({ date: -1 })
      .lean();

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Title', 'Category', 'Amount', 'Description', 'Recurring'];
      const rows = expenses.map(exp => [
        format(new Date(exp.date), 'yyyy-MM-dd'),
        exp.title,
        exp.category,
        exp.amount.toFixed(2),
        exp.description || '',
        exp.isRecurring ? 'Yes' : 'No',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=expenses.csv',
        },
      });
    }

    // JSON format
    return NextResponse.json(expenses);
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to export data' },
      { status: 500 }
    );
  }
}