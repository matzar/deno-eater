import clientPromise from '@/lib/mongodb';

/**
 * @swagger
 * /api/broker1:
 *   get:
 *     summary: Get Broker1 Raw Data
 *     description: >
 *       Fetches raw policy data directly from the broker1 collection in MongoDB.
 *       Returns all documents without any transformation or standardization.
 *     tags:
 *       - Broker Data Sources
 *     responses:
 *       200:
 *         description: Successfully retrieved broker1 data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 documentCount:
 *                   type: integer
 *                   description: Total number of documents in the collection
 *                   example: 150
 *                 message:
 *                   type: string
 *                   example: "Database connection successful"
 *                 documents:
 *                   type: array
 *                   description: Array of raw broker1 policy documents
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       PolicyNumber:
 *                         type: string
 *                         example: "POL-2024-001"
 *                       InsuredAmount:
 *                         type: number
 *                         example: 50000
 *                       Premium:
 *                         type: number
 *                         example: 1250.50
 *                       StartDate:
 *                         type: string
 *                         example: "01/01/2024"
 *                       EndDate:
 *                         type: string
 *                         example: "31/12/2024"
 *                       PolicyType:
 *                         type: string
 *                         example: "Commercial"
 *                       ClientType:
 *                         type: string
 *                         example: "Business"
 *                       Insurer:
 *                         type: string
 *                         example: "ABC Insurance Co"
 *       500:
 *         description: Database connection error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const database = client.db('brokers');
    const collection = database.collection('broker1');
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
