const express = require("express");
const db = require("../data/database");

const router = express.Router();

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const query = `SELECT posts.*, authors.name AS author_name FROM posts
   INNER JOIN authors ON posts.email_id = authors.id`; //using backticks to improve readability;
  const [posts] = await db.query(query);
  res.render("posts-list", { posts: posts });   
});

router.get("/new-post", async function (req, res) {
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
  await db.query(
    "INSERT INTO posts (title ,summary, body , email_id) VALUES (?)",
    [data]
  ); //the data array is read by the ?, and the data arrays will be split and read using the sql import
  //it couldve been VALUES (?,?,?,?),[data(0),data(1),data(2),data(3),]
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res) {
  const query = `
 SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts
 INNER JOIN authors ON posts.email_id = authors.id
 WHERE posts.id = ?
 `;

  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  const postData = {
    ...posts[0], //singlepost thats why we add the [0]
    date: posts[0].date.toISOString(), //machine readable date
    humanReadableDate: posts[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }), //human readable date
  };
  res.render("post-detail", { post: postData });
});

router.get("/posts/:id/edit", async function (req, res) {
  const query = `
  SELECT * FROM posts WHERE id = ?
  `;

  const [posts] = await db.query(query, [req.params.id]);

  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: posts[0] });
});

router.post("/posts/:id/edit", function (req, res) {
  const query = `
  UPDATE posts SET title = ?, summary = ?, body = ?
  WHERE id = ?
  `;

  db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);

  res.redirect('/posts');
});

router.post("/posts/:id/delete", async function(req, res){
  const query = `DELETE FROM posts WHERE id=?` ;

  await db.query(query,[req.params.id]);
  res.redirect('/posts');
})


module.exports = router;
