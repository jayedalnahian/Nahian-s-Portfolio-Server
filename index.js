require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// assignment_project
// TMBbQkamBU6oGFTF
const allowedSides = ["http://localhost:5173", "https://my-portfolio-website-client.web.app"];

app.use(
  cors({
    origin: allowedSides, // Your Firebase frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkxiogp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const projectCollection = client.db("projectDB").collection("project");

    app.post("/projects", async (req, res) => {
      try {
        const newProject = req.body;

        if (!newProject || Object.keys(newProject).length === 0) {
          return res.status(400).json({ error: "Project data is required" });
        }

        const result = await projectCollection.insertOne(newProject);
        res.status(201).json(result); // 201 Created
      } catch (error) {
        console.error("Error adding project:", error);
        res.status(500).json({ error: "Failed to add project" });
      }
    });

    app.get("/projects", async (req, res) => {
      try {
        const projects = await projectCollection.find().toArray();
        res.send(projects);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch projects" });
      }
    });

    app.get("/projects/:id", async (req, res) => {
      try {
        const id = req.params.id;

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid project ID" });
        }

        const query = { _id: new ObjectId(id) };
        const project = await projectCollection.findOne(query);

        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        res.json(project);
      } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: "Failed to fetch project" });
      }
    });

    app.put("/projects/:id", async (req, res) => {
      const { id } = req.params;
      const updatedProject = req.body;
      console.log("Updating project with ID:", id);
      console.log("Payload:", updatedProject);

      try {
        const result = await projectCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedProject }
        );
        res.send(result);
      } catch (err) {
        // res.status(500).send({ error: "Failed to update project" });
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
