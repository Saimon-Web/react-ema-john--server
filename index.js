const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
//middleware
app.use(cors());
app.use(express.json())

//mongodb connected


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h5g7w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('emajohn').collection('product');

   // get api created 
        app.get('/product', async (req, res) => {
            console.log(req.query)
            const page=parseInt(req.query.page);
            const size=parseInt(req.query.size);
            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if(page || size){
                //0 --> skip:0 get:0-10
                //1 --> skip:1*10 get: 11-20
                //2 --> skip:2*10 get: 21-30
                products= await cursor.skip(page*size).limit(size).toArray();
            }
            else{
                products= await cursor.toArray();
            }
     
            res.send(products);
        
        })

        //count product
        app.get('/productCount',async(req,res) => {
          
            const count =await productCollection.estimatedDocumentCount ();
            res.send({count});
        })

   // use post to get products  by ids
   app.post('/productBykeys',async(req,res) => {
       const keys=req.body;
       const ids =keys.map(id => ObjectId(id));
       const query={_id : {$in:ids}}
       const cursor=productCollection.find(query)
       const result=await cursor.toArray();
       res.send(result)
       console.log(keys)
   })

    }
    finally {

    }

}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('ema-john-server is running ')
})
app.listen(port, () => {
    console.log('server connected')
})