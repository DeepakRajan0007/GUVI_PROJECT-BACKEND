const express = require("express");

const collection = require("./mongo");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

const bcrypt = require("bcrypt");

app.get("/", cors(), (req, res) => {});

app.post("/", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request for email:", email);
  try {
    const user = await collection.findOne({ email: email });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        res.json("exist");
      } else {
        console.log("Password mismatch");
        res.json("notexist");
      }
    } else {
      console.log("User not found");
      res.json("notexist");
    }
  } catch (e) {
    console.error("Error during authentication:", e);
    res.json("notexist");
  }
});

app.post("/signup", async (req, res) => {
  const { Name, gender , email, password, Dob  } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const data = {
    Name: Name,
    gender:gender,
    email: email,
    password: hashedPassword, 
    Dob: Dob,
  };

  try {
    const check = await collection.findOne({ email: email });

    if (check) {
      res.json("exist");
    } else {
      res.json("notexist");
      await collection.insertMany([data]);
    }
  } catch (e) {
    res.json("notexist");
  }
});

app.put("/user/:email", async (req, res) => {
  const userEmail = req.params.email;
  const updatedData = req.body;

  try {
   
    const existingUser = await collection.findOne({ email: userEmail });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    
    if (updatedData.name) {
      existingUser.Name = updatedData.name;
    }

    if (updatedData.gender) {
        existingUser.gender = updatedData.gender; 
      }

    if (updatedData.dob) {
      existingUser.Dob = updatedData.dob;
    }

    if (updatedData.email) {
      existingUser.email = updatedData.email;
    }

    
    await existingUser.save();

    res.json({ message: "User details updated successfully", user: existingUser });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/user/:email", async (req, res) => {
  const userEmail = req.params.email;

  try {
    const user = await collection.findOne({ email: userEmail });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (e) {
    console.error("Error fetching user details:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log("port connected");
});
