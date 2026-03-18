const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const formidable = require('express-formidable');
const fsPromises = require('fs').promises;
const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const app = express();
const mongoose = require('mongoose');
const { Console } = require('console');


const mongourl = 'mongodb+srv://sandy:aoNUX4HpR5yaZHKV@cluster0.xebyb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'myproject';
const collectionName = 'to-do';

const client = new MongoClient(mongourl, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
  }
});

app.use(formidable());

var user={}
passport.serializeUser(function(user, done){done(null, user);});
passport.deserializeUser(function(id, done){done(null, user);});

app.use(session({
  secret: 'JyOtIsEcReT',
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new FacebookStrategy({
  clientID: '863157422347410', 
  clientSecret: 'ac63afea03bf956c73eb8fb8c6eac747', 
  callbackURL: 'https://social-task-manager.onrender.com/auth/facebook/callback'
}, async (accessToken, refreshToken, profile, done) => {
  console.log("Facebook Profile: "+JSON.stringify(profile));
  console.log(profile);
  user = {};
  user['id'] = profile.id;
  user['name'] = profile.displayName;
  user['type'] = profile.provider;
  console.log("user object: "+JSON.stringify(user));
  return done(null, user); 
}));

const insertDocument = async (db, doc) => {
  const collection = db.collection(collectionName);
  let results = await collection.insertOne(doc);
  console.log("Insert one document: " + JSON.stringify(results));
  return results;
};

const findUserTasks = async (db, userId) => {
  const collection = db.collection(collectionName);
  let results = await collection.find({ userid: userId }).toArray();
  return results;
};

const findTaskById = async (db, taskId) => {
  const collection = db.collection(collectionName);
  const task = await collection.findOne({ _id: ObjectId.createFromHexString(taskId) });
  return task;
};

const updateDocument = async (db, filter, updateData) => {
  const collection = db.collection(collectionName);
  const result = await collection.updateOne(filter, { $set: updateData });
  console.log("Updated document: " + result.modifiedCount);
  return result;
};

const deleteDocument = async (db, filter) => {
  const collection = db.collection(collectionName);
  const result = await collection.deleteOne(filter);
  console.log("Deleted document: " + result.deletedCount);
  return result;
};

const handle_Find = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const docs = await findUserTasks(db, req.user.id);
  res.status(200).render('list', { nTasks: docs.length, tasks: docs, user: req.user });
};

const handle_Create = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);

  const newDoc = {
    userid: req.user.id,
    task: req.fields.taskname,
    date: req.fields.date
  };

  if (req.files.filetoupload && req.files.filetoupload.size > 0) {
    const data = await fsPromises.readFile(req.files.filetoupload.path);
    newDoc.photo = Buffer.from(data).toString('base64');
  }

  await insertDocument(db, newDoc);
  res.redirect('/');
};

const handle_Edit = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const DOCID = req.query._id;
  const task = await findTaskById(db, DOCID);

  if (task && task.userid === req.user.id) {
    res.status(200).render('edit', { task: task, user: req.user });
  } else {
    res.status(403).render('info', { message: 'Unable to edit - you are not the task owner!', user: req.user });
  }
};

const handle_Update = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);

  let DOCID = { _id: ObjectId.createFromHexString(req.fields._id) };
  const docs = await findUserTasks(db, req.user.id);

  if (docs.length > 0 && docs[0].userid === req.user.id) {
    const updateData = {
      userid: req.user.id,
      task: req.fields.taskname,
      date: req.fields.date
    };

    const results = await updateDocument(db, DOCID, updateData);
    res.status(200).render('info', { message: `Updated ${results.modifiedCount} documents`, user: req.user });
  } else {
    res.status(403).render('info', { message: 'Unable to update - you are not the task owner!', user: req.user });
  }
};

const handle_Delete = async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  let DOCID = { _id: ObjectId.createFromHexString(req.query._id) };
  const docs = await findUserTasks(db, req.user.id);

  const taskToDelete = docs.find(task => task._id.toString() === req.query._id);
  if (taskToDelete && taskToDelete.userid === req.user.id) {
    const task =  taskToDelete.task;
    await deleteDocument(db, DOCID);
    res.status(200).render('info', { message: `Task ${task} removed.`, user: req.user });
  } else {
    res.status(403).render('info', { message: 'Unable to delete - you are not the task owner!', user: req.user });
  }
};

const handle_Details = async (req, res, criteria) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db('myproject');
  const task = await findTaskById(db, criteria._id);
  res.status(200).render('details', { task: task, user: req.user });
};
app.set('view engine', 'ejs');

app.use((req,res,next)=>{
  let d = new Date();
  console.log(`TRACE: ${req.path} was requested at ${d.toLocaleDateString()}`);
  next();
})

const isLoggedIn = (req,res,next) => {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

app.get("/login", function (req, res) {
  res.status(200).render('login');
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: "email" }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { 
    successRedirect: '/content',
    failureRedirect: '/' })
);


app.get('/', isLoggedIn, (req,res) => {
  res.redirect('/content');
})

app.get('/create', isLoggedIn, (req, res) => {
  res.render('create' ,{ user: req.user });
});

app.post('/create', isLoggedIn, (req, res) => {
  handle_Create(req, res);
});

app.get('/content', isLoggedIn, async (req, res) => {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  handle_Find(req, res, req.query);
});

app.get('/details', isLoggedIn,(req, res) => handle_Details(req, res, req.query));

app.get('/edit',isLoggedIn, (req, res) => handle_Edit(req, res, req.query));//req.query

app.get('/update', isLoggedIn, (req, res) => {
  res.redirect('/');
});

app.post('/update', isLoggedIn, (req, res) => {
  handle_Update(req, res);
});

app.get('/delete',isLoggedIn, (req, res) => handle_Delete(req, res));

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});




/*Restful*/
app.post('/api/record', async (req, res) => {
  if (user.id) {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  let newDoc = {
  userid: user.id,
  task: req.fields.task,
  date: req.fields.date
  };
  await insertDocument(db, newDoc);
  res.status(200).json({"Successfully inserted":newDoc.userid}).end();
  }else {
  res.status(500).json({"error": "missing ID"});
  }
  })
  
  app.get('/api/record', async (req,res) => {
  if (user.id) {
  await client.connect();
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  const docs = await findUserTasks(db, user.id); 
  res.status(200).json(docs);
  }
  else {
  res.status(500).json({ "error": "missing userid"}).end();
  }
  });
  
  
  
  app.put('/api/record', async (req,res) => {
  if(user.id){
  console.log(req.body);
  
  await client.connect();
  const db = client.db(dbName);
  let criteria = {userid: user.id };
  let updateData = req.fields;
  const results = await updateDocument(db, criteria, updateData);
  
  res.status(200).json(results).end();
  } else {
  res.status(500).json({"error": "missing userid"});
  }
  })
  
  app.delete('/api/record/:task', async (req,res) => {
  if(req.params.task){
  console.log(req.params.task)
  
  await client.connect();
  const db = client.db(dbName);
  const criteria = {task: req.params.task };
  const results = await deleteDocument(db,criteria);
  
  console.log(results)
  res.status(200).json(results).end();
  } else {
  res.status(500).json({"error": "missing userid"});
  }
  })
  
  /*Restful*/
  
  
  app.get((req, res) => {
    res.status(404).render('info', { message: `${req.path} - Unknown request!` });
  });
  
  const port = process.env.PORT || 8099;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
  
  


