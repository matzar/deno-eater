import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const database = client.db('brokers');
    const collection = database.collection('broker2');
    const docCount = await collection.countDocuments({});
    const documents = await collection.find({}).toArray();

    return Response.json({
      success: true,
      documentCount: docCount,
      message: 'Database connection successful',
      documents: documents,
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
