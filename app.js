const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Import voters data (temporary in-memory database)
const voterData = require('./votersData');

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.json()); // For parsing JSON

// Admin credentials (for simplicity, can be enhanced with encryption)
const adminCredentials = {
    username: 'admin',
    password: 'admin123'
};

// Routes

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve the voting page
app.get('/vote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/vote.html'));
});

// Serve the About page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/about.html'));
});

// Serve the Instructions page
app.get('/instructions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/instructions.html'));
});

// Serve the admin login page
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin-login.html'));
});

// Handle admin login (POST request)
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.status(200).json({ message: 'Login successful!' });
    } else {
        res.status(401).json({ error: 'Invalid credentials!' });
    }
});

// Serve the admin dashboard page
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin-dashboard.html'));
});

// Handle vote submission
app.post('/vote', (req, res) => {
    const { voterId, candidate } = req.body;

    // Ensure the voter is allowed to vote and hasn't already voted
    if (!voterId || !candidate) {
        return res.status(400).json({ error: 'Voter ID and candidate are required!' });
    }

    const totalVoters = voterData.voters.length;
    const votesCast = voterData.votes.length;

    // Close voting if all voters have voted
    if (votesCast >= totalVoters) {
        return res.status(400).json({ error: 'Voting is closed!' });
    }

    // Log the vote (no restrictions on duplicates yet)
    voterData.votes.push({ voterId, candidate });

    // Respond with success
    res.status(200).json({ message: 'Vote submitted successfully!' });
});
app.get('/vote-status', (req, res) => {
    const totalVoters = voterData.voters.length;
    const votesCast = voterData.votes.length;

    if (votesCast >= totalVoters) {
        return res.status(200).json({ votingClosed: true });
    } else {
        return res.status(200).json({ votingClosed: false });
    }
});

// Handle the results page
app.get('/results', (req, res) => {
    const totalVoters = voterData.voters.length;
    const votesCast = voterData.votes.length;

    // Allow access only if at least half the voters have voted
    if (votesCast < totalVoters / 2) {
        return res.status(403).send('Results are not available yet. At least half the voters must vote.');
    }

    // Count votes for each candidate
    const voteCounts = voterData.votes.reduce((acc, vote) => {
        acc[vote.candidate] = (acc[vote.candidate] || 0) + 1;
        return acc;
    }, {});

    res.status(200).json(voteCounts);
});

// API to fetch voter and votes data for the admin dashboard
app.get('/voter-data', (req, res) => {
    res.status(200).json(voterData);
});

// 404 Handler (for undefined routes)
app.use((req, res) => {
    res.status(404).send('Page not found!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
