const express = require('express');
const app = express();
const articleRoutes = require('./routes/articles');
const port = 3001;

app.use(express.json());


app.use('/articles', articleRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
