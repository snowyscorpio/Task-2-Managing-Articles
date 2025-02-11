const express = require('express');
const router = express.Router();
const dbSingleton = require('../dbSingleton');
const db = dbSingleton.getConnection();

// get all articles with optional filtering
router.get('/', (req, res, next) => {
  try {
    const { author, afterDate, keyword } = req.query;
    let query = 'SELECT * FROM articles';
    let params = [];

    if (author || afterDate || keyword) {
      query += ' WHERE';
      let conditions = [];

      if (author) {
        conditions.push(' author = ?');
        params.push(author);
      }
      if (afterDate) {
        conditions.push(' created_at > ?');
        params.push(afterDate);
      }
      if (keyword) {
        conditions.push(' title LIKE ?');
        params.push(`%${keyword}%`);
      }

      query += conditions.join(' AND');
    }

    db.query(query, params, (err, results) => {
      if (err) return next(err);
      res.json(results);
    });
  } catch (error) {
    next(error);
  }
});

// get a single article by ID
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM articles WHERE id = ?';

    db.query(query, [id], (err, results) => {
      if (err) return next(err);
      if (results.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }
      res.json(results[0]);
    });
  } catch (error) {
    next(error);
  }
});

//add a new article
router.post('/', (req, res, next) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const query = 'INSERT INTO articles (title, content, author) VALUES (?, ?, ?)';
    db.query(query, [title, content, author], (err, results) => {
      if (err) return next(err);
      res.status(201).json({ message: 'Article added!', id: results.insertId });
    });
  } catch (error) {
    next(error);
  }
});

// update an article by ID
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const checkQuery = 'SELECT * FROM articles WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
      if (err) return next(err);
      if (results.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const updateQuery = 'UPDATE articles SET title = ?, content = ?, author = ? WHERE id = ?';
      db.query(updateQuery, [title, content, author, id], (updateErr) => {
        if (updateErr) return next(updateErr);
        res.json({ message: 'Article updated successfully' });
      });
    });
  } catch (error) {
    next(error);
  }
});

//delete an article by ID
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const checkQuery = 'SELECT * FROM articles WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
      if (err) return next(err);
      if (results.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const deleteQuery = 'DELETE FROM articles WHERE id = ?';
      db.query(deleteQuery, [id], (deleteErr) => {
        if (deleteErr) return next(deleteErr);
        res.json({ message: 'Article deleted successfully' });
      });
    });
  } catch (error) {
    next(error);
  }
});

// get the total number of articles
router.get('/count', (req, res, next) => {
  try {
    const query = 'SELECT COUNT(*) AS total FROM articles';
    db.query(query, (err, results) => {
      if (err) return next(err);
      res.json({ total: results[0].total });
    });
  } catch (error) {
    next(error);
  }
});

// get a list of unique authors
router.get('/authors', (req, res, next) => {
  try {
    const query = 'SELECT DISTINCT author FROM articles';
    db.query(query, (err, results) => {
      if (err) return next(err);
      res.json(results);
    });
  } catch (error) {
    next(error);
  }
});

//error handling middleware
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = router;
