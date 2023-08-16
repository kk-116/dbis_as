const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001

const db = require('./queries')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const session = require('express-session')

const corsOptions ={
  origin:['http://localhost:3000'], 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
  methods: ["GET", "POST", "PUT", "DELETE"]
}


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true,}))
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())




app.use(session({
  key: "userID",
  secret: "ANUBHAB",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24*60*60*1000, //24 hours--its in millisecs
  }
}))


//for checking sessions
app.get('/login-session',(req,res)=>{
  if(req.session.user){
    res.send({loggedIn: true, user: req.session.user})
  }else {
    res.send({loggedIn: false})
  }
})

//for logout of sessions
app.get('/logout-session', (req, res) => {
  if(req.session.user){
    res.clearCookie('userID');
    res.send({loggedIn: false})
  }else {
    res.send({"msg": "No session cookie to clear!"})
  }
});






app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})
app.post('/verify_login', db.validateUser)

// app.get('/users', db.getUsers)
// app.get('/users/:id', db.getUserById)
// app.post('/users', db.createUser)
// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)

//only for testing
app.get("/register/:ID/:pwd", db.populateHashTable)
app.get("/test1", db.multipleQuery)


//real work starts here
app.post("/fetchStudentInfo", db.getStudentInfo)
app.get("/fetchAllInstructors", db.getALLInstructors)
app.get("/fetchAllCourses", db.getALLCourse)
app.post("/fetchInstructorInfo", db.getInstructorInfo)

app.post("/validateStudent",db.validateStudent)

app.post("/validateStudAndFetchStudInfo", db.validateStudAndFetch)
app.post("/validateStudAndFetchCourses", db.validateStudAndFetchRegCourses)


app.post("/fetchCourseInfo", db.fetchCourseInfo)
app.get("/fetchAllDepts", db.getAllDepts)
app.post("/fetchAllCoursesOfDept", db.fetchDeptCourses)


app.post("/fetchInstructor_Info", db.fetchInstructorInfo)

app.post("/regCourse", db.insertIntoTable)
app.post("/dropCourse", db.dropFromTable)


app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`App running on port ${port}.`)
})  