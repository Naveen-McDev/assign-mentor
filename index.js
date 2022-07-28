import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";


const app = express();

app.use(express.json());

//configure dotenv
dotenv.config();

//PORT
const PORT = process.env.PORT;

//mongodb-url
const DB_URL = process.env.MONGODB_URL;

//createConnection
async function createConnection() {
    const client = new MongoClient(DB_URL)
    await client.connect();
    console.log("mongo connected");
    return client;
}
const client = await createConnection();



//create mentor
app.post("/creatementor", async function (req, res) {
    const data = req.body;
    const result = await client.db("map35").collection("mentors").insertOne(data);
    res.send(result);

})
//create student
app.post("/createstudent", async function (req, res) {
    const data = req.body;
    const result = await client.db("map35").collection("students").insertOne(data);
    res.send(result);

})

//  adding mentor for multiple student

app.put("/addmentor/:name", async function (req, res) {
    let { name } = req.params;
    let data = req.body.students;
    const result = await client.db("map35").collection("mentors").updateMany({ name: name }, { $set: { students: data } });
    data.map(async (student) => {
        let result = await client.db("map35").collection("students").updateMany({ name: student }, { $set: { mentor: name } });
    })
    res.send(result)


})

//change mentor for particular student

app.put("/changementor/:name", async function (req, res) {
    const { name } = req.params;


    const result = await client.db("map35").collection("students").updateOne({ name: name }, { $set: { mentor: req.body.mentor } });
    res.send(result)
})


// get all students of particular mentor

app.get("/getstudent/:id", async function (req, res) {
    const { id } = req.params;
    console.log(id)
    const data = await client.db("map35").collection("mentors").find({ _id: ObjectId(id) }, { students: 1 }).toArray();
    console.log(data)
    res.send(data);
})

app.get("/",function(req,res){
    res.send("hello welcome to the app")
});

app.listen(PORT, () => console.log(`server started in port ${PORT}`));