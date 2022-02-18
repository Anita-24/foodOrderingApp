const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3300;
const path = require('path');
const ejs =require('ejs');
const expressLayout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session =require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const passport = require('passport');
const Emitter = require('events');


//Database connection

mongoose.connect(process.env.MONGO_CONNECTION_URL,{useNewUrlParser: true});
const connection = mongoose.connection;
connection.once('open' , ()=>{
    console.log('Database Connected...');
});

//Event Emitter

const eventEmitter = new Emitter();
app.set('eventEmitter',eventEmitter);


//Session Config

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave : false,
    store : MongoDbStore.create({
        mongoUrl: 'mongodb://localhost/pizza',

    }),
    saveUninitialized: false,
    cookie : {maxAge : 1000* 60* 60 * 24}

}));


// passport config

const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

//Asssets
app.use(express.static('public'));

app.use(express.urlencoded({extended:false}));

app.use(express.json());


//Global middlewares

app.use((req,res,next)=>{
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
})

//set Template Engine
app.use(expressLayout);

app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname , '/resources/views'));

require('./routes/web')(app);

app.use((req,res) => {
    res.status(404).send('<h1>404!! PAGE NOT FOUND</h1>');
});


const server = app.listen(PORT , ()=>{
    console.log('Listening on port:', PORT);
})


// SOCKET

const io = require('socket.io')(server);

// listening on connection 
io.on('connection' , (socket)=>{
  
    //Join rooms
    socket.on('join' , (orderId)=>{
        socket.join(orderId);
    })

})

//listening to orderupdated status event from client
eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated' , data);
});


//listening to orderPlaced status event from client

eventEmitter.on('orderPlaced' , (data)=>{
    io.to('adminRoom').emit('orderPlaced' , data);
});