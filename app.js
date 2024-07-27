const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth.js');
const postRoutes = require('./routes/post.js');

const app = express();

mongoose.connect('mongodb+srv://walshakmanasseh:BxK3XXicKP22wmWz@cluster0.hz2a32n.mongodb.net/3mtt-backend', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/api', postRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
