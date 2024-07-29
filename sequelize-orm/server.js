const express = require("express");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const _USERS = require("./users.json");

const app = express();
const port = 8001;

const connection = new Sequelize("db", "user", "pass", {
  host: "localhost",
  dialect: "sqlite",
  storage: "db.sqlite", // File to store db in
  operatorsAliases: false,
  // define: {
  //   freezeTableName: true,
  // },
});

// Model with columns, using json
const User = connection.define("User", {
  name: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    validate: {
      isAlphanumeric: true,
    },
  },
});

const Post = connection.define("Post", {
  // id: {
  //   primaryKey: true,
  //   type: Sequelize.UUID,
  //   defaultValue: Sequelize.UUIDV4
  // },
  title: Sequelize.STRING,
  content: Sequelize.TEXT,
});

const Comment = connection.define("Comment", {
  the_comment: Sequelize.STRING,
});

const Project = connection.define("Project", {
  title: Sequelize.STRING,
});

// Model with columns, hard coded attributes
// const User = connection.define(
//   "User",
//   {
//     uuid: {
// Creates an id column as primary key
//   type: Sequelize.UUID,
//   primaryKey: true,
//   defaultValue: Sequelize.UUIDV4,
// },
// first: {
//   type: Sequelize.STRING,
// validate: {
//   // Adds validator of min 3 length
//   len: [3],
// },
// },
// last: Sequelize.STRING,
// full_name: Sequelize.STRING,
// bio: {
//   type: Sequelize.TEXT,
// validate: {
//   // Adds validator that it must contain "foo", else error message
//   contains: {
//     args: ["foo"],
//     msg: "Error: Field must contain foo",
//   },
// },
//   },
// },
// {
//   timestamps: false,
// },
//   {
//     hooks: {
//       beforeValidate: () => {
//         console.log("before validate");
//       },
//       afterValidate: () => {
//         console.log("after validate");
//       },
//       beforeCreate: (user) => {
//         user.full_name = `${user.first} ${user.last}`
//         console.log("before create");
//       },
//       afterCreate: () => {
//         console.log("after create");
//       },
//     },
//   }
// );

// Endpoint to get all posts
app.get("/allposts", (req, res) => {
  Post.findAll({
    include: [
      {
        model: User,
        as: "UserRef",
      },
    ],
  })
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send(error);
    });
});

// Endpoint to get a single post
app.get("/singlepost", (req, res) => {
  Post.findById("1", {
    include: [
      {
        model: Comment,
        as: "All_Comments",
        attributes: ["the_comment"],
      },
      {
        model: User,
        as: "UserRef",
      },
    ],
  })
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send(error);
    });
});

// Endpoint to find all
app.get("/findall", (req, res) => {
  User.findAll({
    // where: {
    //   name: {
    //     [Op.like]: 'Em%' // Use Op to use 'like' to search by regex
    //   }
    // }
  })
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send(error);
    });
});

// Endpoint to find one by id
// app.get('/findOne', (req, res) => {
//   User.findById('55')
//       .then(user => {
//         res.json(user);
//       })
//       .catch(error => {
//         console.log(error);
//         res.status(404).send(error);
//       })
// })

// Endpoint to update
// app.put('/update', (req, res) => {
//   User.update({
//     name: 'Michael Keaton',
//     password: 'password'
//   }, { where: { id: 55 }})
//       .then(rows => {
//         res.json(rows);
//       })
//       .catch(error => {
//         console.log(error);
//         res.status(404).send(error);
//       })
// })

// Endpoint to post
// app.post("/post", (req, res) => {
//   const newUser = req.body.user;
//   // User.create({
//   //   name: "Jo",
//   //   bio: "New bio entry 2",
//   // })
//   User.create(newUser)
//     .then((user) => {
//       res.json(user);
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(404).send(error);
//     });
// });

// Endpoint to delete
// app.delete('/remove', (req, res) => {
//   User.destroy({
//     where: { id: 50 }
//   })
//   .then(() => {
//     res.send('User successfully deleted');
//   })
//   .catch(error => {
//     console.log(error);
//     res.status(404).send(error);
//   })
// })

// Endpoint to add a worker. Many to many
app.put("/addWorker", (req, res) => {
  Project.findById(2)
    .then((project) => {
      project.addWorkers(5);
    })
    .then(() => {
      res.send("User added");
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send(error);
    });
});

// Endpoint to get user projects Many to many
app.get("/getUserProjects", (req, res) => {
  User.findAll({
    attributes: ["name"],
    include: [
      {
        model: Project,
        as: "Tasks",
        attributes: ["title"],
      },
    ],
  })
    .then((output) => {
      res.json(output);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send(error);
    });
});

Post.belongsTo(User, { as: "UserRef", foreignKey: "userId" }); // puts foreignKey userId in Post table
Post.hasMany(Comment, { as: "All_Comments" }); // foreignKey = PostId in Comment table

// Creates a UserProjects table with IDs for ProjectId and UserId
User.belongsToMany(Project, { as: "Tasks", through: "UserProjects" });
Project.belongsToMany(User, { as: "Workers", through: "UserProjects" });

// Connect to db
connection
  .sync({
    // logging: console.log,
    force: true, // Drops table at beginning
  })
  // Add a User to db with name and bio
  .then(() => {
    // Hard coded User
    // User.create({
    //   first: "Joe",
    //   last: "Smith",
    //   bio: "New bio entry 2",
    // });

    // Add users from json
    User.bulkCreate(_USERS)
      .then((users) => {
        console.log("Success adding users");
      })
      .catch((error) => {
        console.log(error);
      });
  })
  .then(() => {
    Project.create({
      title: "project 1",
    }).then((project) => {
      project.setWorkers([4, 5]);
    });
  })
  .then(() => {
    Project.create({
      title: "project 2",
    });
  })
  .then(() => {
    Post.create({
      userId: 1, // Foreign key
      title: "First post",
      content: "post content 1",
    });
  })
  .then(() => {
    Post.create({
      userId: 1, // Foreign key
      title: "Second post",
      content: "post content 2",
    });
  })
  .then(() => {
    Post.create({
      userId: 2, // Foreign key
      title: "Third post",
      content: "post content 3",
    });
  })
  .then(() => {
    Comment.create({
      PostId: 1, // Foreign key
      the_comment: "first comment",
    });
  })
  .then(() => {
    Comment.create({
      PostId: 1, // Foreign key
      the_comment: "second comment here",
    });
  })
  .then(() => {
    console.log("Connection to database established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.listen(port, () => {
  console.log("Running server on port " + port);
});
