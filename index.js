const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8bgsx7j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
const carsCollection = client.db('carDB').collection('cars');

//apis
app.get('/cars', async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || ''; 
    const sortField = req.query.sortField || ''; 
    const sortOrder = req.query.sortOrder || ''; 

    const skip = (page - 1) * limit; 

    // Search for products by name (case-insensitive)
    const query = searchQuery ? { ProductName: { $regex: searchQuery, $options: 'i' } } : {};

    // Build the sort object
    let sort = {};
    if (sortField && sortOrder) {
        sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    }

    const totalItems = await carsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const result = await carsCollection.find(query).sort(sort).skip(skip).limit(limit).toArray();
    
    res.send({
        totalItems,
        totalPages,
        currentPage: page,
        items: result
    });
});



app.get('/', (req,res) =>{
    res.send('Job task server is running')
    })
    
    app.listen(port, ()=>{
        console.log(`server is running on port: ${port}`)
    })


    
