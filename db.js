const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')

const app = express();
const port = 3000;
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB database
mongoose.connect('mongodb+srv://ayushr16060:%40yusH11011@cluster0.3ekelbj.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define a schema for your data
const dataSchema = new mongoose.Schema({
    hashCode: String,
});

// Create a model based on the schema
const Data = mongoose.model('Data', dataSchema);

// Express middleware to parse JSON bodies
app.use(express.json());

// Endpoint to handle POST requests from frontend
app.get("/del", (req, res) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ipAddress);
    res.sendFile(path.join(__dirname + "/index.html"))
})
app.post('/store-hash', async (req, res) => {
    try {
        // Extract serial number from request body
        const { hashCode } = req.body;
        // Create a new document using the Data model
        Data.findOne({ hashCode: hashCode })
            .then(async (data) => {
                if (data) {
                    // Data is present
                    console.log('Data found:', data);
                    // Send response to client
                    res.send({ status: 405, msg: 'Please Enter Unique serial number to store the data!' });
                } else {
                    // Data is not present
                    console.log('Data not found');

                    const newData = new Data({
                        hashCode: hashCode
                    });
                    await newData.save();


                    // Save the document to the database
                    console.log('Data saved successfully!');

                    // Send response to client
                    res.send({ status: 200, msg: 'Data saved successfully!' });
                }
            })
            .catch(error => {
                console.error('Error retrieving data:', error);
                res.status(500).send('Internal server error');
            });

    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Internal server error');
    }
});
app.get("/:id", function (req, res) {
    const id = req.params.id;
    // console.log(id);
    Data.findOne({ hashCode: id })
        .then(async (data) => {
            if (data) {
                // Data is present
                console.log('Data found:', data);

                res.status(200).send("Valid id here is your product")
                const delResult = await Data.deleteOne({ hashCode: id })
                console.log(delResult);

            } else {
                // Data is not present
                console.log('Data not found');
                res.status(404).send('Data not found');
            }
        })
        .catch(error => {
            console.error('Error retrieving data:', error);
            res.status(500).send('Internal server error');
        });

})
// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
