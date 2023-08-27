const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const ProductModel = require('./models/products')
const User = require('./models/users')
const QueryModel = require('./models/query');

const Razorpay = require("razorpay");

const RAZOR_PAY_KEY_ID="rzp_test_Fo9DGjTaOK5EDP";
const RAZOR_PAY_KEY_SECRET="njIIYbABYCUjc71w2sNW5KA2";

const instance = new Razorpay({
  key_id: RAZOR_PAY_KEY_ID,
  key_secret: RAZOR_PAY_KEY_SECRET,
});


const dburl = "mongodb+srv://abhashkr99:xNMXlun9YMMb6DJB@cluster0.rg8l8wh.mongodb.net/vege_logs?retryWrites=true&w=majority";

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect(dburl, connectionParams)
    .then(() => {
        console.info("Connected to Database");
    })
    .catch((e) => {
        console.log("Error:", e);
    });

const app = express()
app.use(cors())
app.use(express.json())

app.listen(4000, () => {
    console.log("Server Running")
})

app.get("/getproducts", (req, res) => {
    ProductModel.find()
        .then(products => res.json(products))
        .catch(err => res.json(err))
})

app.get('/getUser', async (req, res) => {
  const { email } = req.query;

  try {
      const user = await User.findOne({ email });
      if (user) {
          res.json(user);
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving user' });
  }
});

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            address: {
              address: null,
              city: null,
              state: null,
              zip: null
          },
          premiumUser: false,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error at server' });
    }
});

app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email } });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred' });
    }
  });

  app.post("/updateAddress", async (req, res) => {
    try {
        const { email, address, city, state, zip } = req.body;

        const userToUpdate = await User.findOne({ email });
        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        userToUpdate.address.address = address || userToUpdate.address.address;
        userToUpdate.address.city = city || userToUpdate.address.city;
        userToUpdate.address.state = state || userToUpdate.address.state;
        userToUpdate.address.zip = zip || userToUpdate.address.zip;

        await userToUpdate.save();

        res.status(200).json({ message: 'Address updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error at server' });
    }
});


app.post("/updateInfo", async (req, res) => {
  try {
      const {email, name } = req.body;

      const userToUpdate = await User.findOne({ email });
      if (!userToUpdate) {
          return res.status(404).json({ message: 'User not found' });
      }

      userToUpdate.name = name || userToUpdate.name;

      await userToUpdate.save();

      res.status(200).json({ message: 'Info updated successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error at server' });
  }
});

app.post("/updatePremium", async (req, res) => {
  try {
      const {email, premiumUser } = req.body;

      const userToUpdate = await User.findOne({ email });
      if (!userToUpdate) {
          return res.status(404).json({ message: 'User not found' });
      }

      userToUpdate.premiumUser = premiumUser || userToUpdate.premiumUser;

      await userToUpdate.save();

      res.status(200).json({ message: 'Info updated successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error at server' });
  }
});

  app.post('/putquery', async (req, res) => {
    try {
      const { firstName, email, phoneNumber, query } = req.body;
      const querys = new QueryModel({ firstName, email, phoneNumber, query });
      await querys.save();
      res.status(201).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred' });
    }
  });


  app.get("/order", (req, res) => {
    try {
      const options = {
        amount: 10 * 100,
        currency: "INR",
        receipt: "receipt#1",
        payment_capture: 0,
      };
    instance.orders.create(options, async function (err, order) {
      if (err) {
        return res.status(500).json({
          message: "Something Went Wrong",
        });
      }
    return res.status(200).json(order);
   });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
   }
  });


  app.post('/capture/:paymentId', async (req, res) => {
    try {
      const paymentId = req.params.paymentId;
      const response = await instance.payments.capture(paymentId,1000,'INR');
  
      console.log('Capture Response:', response);
  
      return res.status(200).json(response);
    } catch (err) {
      console.error('Capture Error:', err);
      return res.status(500).json({
        message: 'Something Went Wrong',
      });
    }
  });
