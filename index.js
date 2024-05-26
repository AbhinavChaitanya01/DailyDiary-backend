const express = require('express');
const app = express();
var cors = require('cors')
app.use(cors())
const connectToMongoDB = require("./db.js");
app.use(express.json());
connectToMongoDB();

app.get('/',(req,res)=>{
    res.send("Hello World");
})
app.use('/api/v1/auth', require('./routes/auth.js'));
app.use('/api/v1/diaryentry', require('./routes/entryRoutes.js'));
app.listen(process.env.PORT ||5000,()=>{
    console.log("Connected to db");
})