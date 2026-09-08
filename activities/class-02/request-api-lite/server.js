import express from 'express';

const app = express();
app.use(express.json());

const requests = [
  {
    id: 1,
    title: 'Projector does not turn on',
    description: 'The projector in room 204 shows no image during class.',
    status: 'open',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Broken chair in the lab',
    description: 'One chair in the computer lab has a loose back rest.',
    status: 'in-progress',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Wi-Fi drops in the library',
    description: 'The connection drops every few minutes on the second floor.',
    status: 'open',
    priority: 'low'
  }
];

let nextId = 4;

app.get('/getRequests', (req, res) => {
  res.json(requests);
});

app.get('/requests/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const request = requests.find(r => r.id === id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  res.json(request);
});

app.post('/requests', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title || !description || !priority) {
    return res.status(400).json({ error: 'title, description, and priority are required' });
  }
  const newRequest = {
    id: nextId++,
    title,
    description,
    status: 'open',
    priority
  };
  requests.push(newRequest);
  res.status(201).json(newRequest);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Request API Lite is running on http://localhost:${PORT}`);
});
