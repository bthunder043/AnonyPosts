import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

let posts = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts ORDER BY id DESC");
    posts = result.rows;
    res.render("index.ejs", { posts: posts, editId: null });
  } catch (error) {
    console.log(error);
  }
});

//new post
app.post("/submit", async (req, res) => {
  const newPost = {
    title: req.body.title,
    content: req.body.content,
  };
  try {
    await db.query("INSERT INTO posts (title, content) VALUES ($1, $2)", [
      newPost.title,
      newPost.content,
    ]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

// editing post
app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM posts ORDER BY id DESC");
    posts = result.rows;
    res.render("index.ejs", { posts: posts, editId: parseInt(id) });
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const { title, content } = req.body;

  try {
    await db.query("UPDATE posts SET title = $1, content = $2 WHERE id = $3", [
      title,
      content,
      id,
    ]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
