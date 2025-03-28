const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hvsn9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const userCollection = client.db('Festify').collection('users');
    const menuCollection = client.db('Festify').collection('menu');
    const cartCollection = client.db('Festify').collection('carts');

    // user API 
    app.get('/users', async(req,res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    }); 
    
    app.post('/users', async(req,res)=> {
      const user = req.body;
      // insert email if user doesen't exit 
      // there is three way to do 1.email unique, 2.upsert 3.simple checking
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        return res.send({message: 'user already exist', insertedId:null})
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    app.delete('/users/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })
    
    // end user API 
    app.get('/menu', async(req, res) => {
        const result = await menuCollection.find().toArray();
        res.send(result)
    })

    app.get('/carts', async(req, res) => {
      const email = req.query.email
      const query = {email: email}
      const result = await cartCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/carts', async(req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('boss is sitting')
})

app.listen(port, () => {
    console.log(`the dayly dish is sitting on port ${port}`);
})