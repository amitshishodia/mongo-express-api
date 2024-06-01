const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://mongo-0.mongo-headless.default.svc.cluster.local:27017/eventsdb', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Event Schema
const eventSchema = new mongoose.Schema({
    eventid: String,
    eventname: String,
    eventdescription: String,
    eventdate: Date,
    manager: String
});

const Event = mongoose.model('Event', eventSchema);

// Routes
app.post('/events', async (req, res) => {
    const { eventid, eventname, eventdescription, eventdate, manager } = req.body;

    const event = new Event({
        eventid,
        eventname,
        eventdescription,
        eventdate,
        manager
    });

    try {
        await event.save();
        res.status(201).send(event);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).send(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/events/:eventid', async (req, res) => {
    const { eventid } = req.params;
    try {
        const event = await Event.findOne({ eventid });
        if (!event) {
            return res.status(404).send({ message: 'Event not found' });
        }
        res.status(200).send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
