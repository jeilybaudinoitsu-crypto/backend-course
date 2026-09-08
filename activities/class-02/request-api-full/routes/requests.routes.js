import { Router } from 'express';
import { requests, generateId } from '../data/requests.js';

const router = Router();

router.get('/getRequests', (req, res) => {
  res.json(requests);
});

router.get('/requests/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const request = requests.find(r => r.id === id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  res.json(request);
});

router.post('/requests', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title || !description || !priority) {
    return res.status(400).json({ error: 'title, description, and priority are required' });
  }
  const newRequest = {
    id: generateId(),
    title,
    description,
    status: 'open',
    priority
  };
  requests.push(newRequest);
  res.status(201).json(newRequest);
});

export default router;
