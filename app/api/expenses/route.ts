import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';

export async function POST(request: Request) {
  try {
    console.log('📝 Creating expense...');
    
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    console.log('✅ Session found for user:', session.user.id);

    // 2. Get user ID
    const userId = session.user.id;
    
    if (!userId) {
      console.log('❌ No user ID');
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    console.log('📝 Request body:', body);

    // 4. Validate required fields
    if (!body.title || !body.amount || !body.category || !body.date) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Title, amount, category, and date are required' },
        { status: 400 }
      );
    }

    // 5. Connect to database
    console.log('🔄 Connecting to MongoDB...');
    await dbConnect();
    console.log('✅ MongoDB connected');

    // 6. Create expense
    const expenseData = {
      user: userId,
      title: body.title,
      amount: parseFloat(body.amount),
      category: body.category,
      description: body.description || '',
      date: new Date(body.date),
      isRecurring: body.isRecurring || false,
      recurringFrequency: body.recurringFrequency || null,
    };

    console.log('📝 Creating expense with data:', expenseData);

    const expense = await Expense.create(expenseData);
    console.log('✅ Expense created:', expense._id);

    return NextResponse.json({
      success: true,
      expense,
      message: 'Expense created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating expense:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create expense',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await dbConnect();

    const query: any = { user: userId };

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Expense.countDocuments(query),
    ]);

    return NextResponse.json({
      expenses: expenses || [],
      pagination: {
        total: total || 0,
        page: page || 1,
        limit: limit || 10,
        totalPages: Math.ceil((total || 0) / limit) || 1,
      },
    });

  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch expenses',
        expenses: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
      { status: 500 }
    );
  }
}