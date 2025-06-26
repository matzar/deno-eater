import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const database = client.db('random-words');
    const collection = database.collection('words');
    const docCount = await collection.countDocuments({});

    return Response.json({
      success: true,
      documentCount: docCount,
      message: 'Database connection successful',
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
