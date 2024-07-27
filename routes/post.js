const express = require('express');
const Post = require('../models/Post.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

router.get('/posts', async (req, res) => {
  try {
    const { page = 1, search, state = 'published', order_by = 'timestamp' } = req.query;
    const perPage = 20;

    let query = { state };
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const posts = await Post.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ [order_by]: 1 })
      .populate('author', 'first_name last_name');
    
    res.send(posts);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'first_name last_name');
    if (!post || post.state !== 'published') {
      return res.status(404).send({ error: 'Post not found' });
    }
    post.read_count += 1;
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post('/posts', auth, async (req, res) => {
  try {
    const { title, description, tags, body } = req.body;
    const post = new Post({
      title,
      description,
      tags,
      body,
      author: req.user._id
    });
    post.calculateReadingTime();
    await post.save();
    res.status(201).send({ message: 'Post created successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.put('/posts/:id', auth, async (req, res) => {
  try {
    const { title, description, tags, body, state } = req.body;
    const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
    if (!post) {
      return res.status(404).send({ error: 'Post not found or not authorized' });
    }

    if (title) post.title = title;
    if (description) post.description = description;
    if (tags) post.tags = tags;
    if (body) {
      post.body = body;
      post.calculateReadingTime();
    }
    if (state) post.state = state;

    await post.save();
    res.send({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!post) {
      return res.status(404).send({ error: 'Post not found or not authorized' });
    }
    res.send({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.get('/user/posts', auth, async (req, res) => {
  try {
    const { state } = req.query;
    const query = { author: req.user._id };
    if (state) {
      query.state = state;
    }

    const posts = await Post.find(query);
    res.send(posts);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
