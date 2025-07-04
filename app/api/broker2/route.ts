import clientPromise from '@/lib/mongodb';

/**
 * @swagger
 * /api/broker2:
 *   get:
 *     summary: Get Broker2 Raw Data
 *     description: >
 *       Fetches raw policy data directly from the broker2 collection in MongoDB.
 *       Returns all documents without any transformation or standardization.
 *       Note that broker2 uses different field names than broker1.
 *     tags:
 *       - Broker Data Sources
 *     responses:
 *       200:
 *         description: Successfully retrieved broker2 data
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
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Database connection successful"
 *                 documents:
 *                   type: array
 *                   description: Array of raw broker2 policy documents
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439012"
 *                       PolicyRef:
 *                         type: string
 *                         example: "REF-2024-002"
 *                       CoverageAmount:
 *                         type: number
 *                         example: 75000
 *                       CoverageCost:
 *                         type: number
 *                         example: 1850.75
 *                       InitiationDate:
 *                         type: string
 *                         example: "15/01/2024"
 *                       ExpirationDate:
 *                         type: string
 *                         example: "14/01/2025"
 *                       ContractCategory:
 *                         type: string
 *                         example: "Personal"
 *                       ConsumerCategory:
 *                         type: string
 *                         example: "Individual"
 *                       Underwriter:
 *                         type: string
 *                         example: "XYZ Insurance Ltd"
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
