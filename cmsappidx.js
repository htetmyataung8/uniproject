const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const app = express();

require('dotenv').config();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(helmet());
app.use(express.urlencoded({limit:'500mb', extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles : true,
  tempFileDir : '/tmp/'
}));


app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "default-src 'self' https://fonts.googleapis.com/css; img-src * 'self' data:; font-src 'self' https://fonts.gstatic.com/; style-src 'self' https://fonts.googleapis.com/ https://cdnjs.cloudflare.com/; script-src 'self' https://cdnjs.cloudflare.com/ https://cdn.jsdelivr.net")
    next();
});

const sequelize = require('./utils/dbconnector');

const accountsRoutes = require('./routes/accountsRoute');
const companiesRoutes = require('./routes/companiesRoute');
const academicsRoutes = require('./routes/academicsRoute');
const agentsRoutes = require('./routes/agentsRoute');
const generalRoutes = require('./routes/generalRoute');
const errorsRoutes = require('./routes/errorsRoute');

const tutorialRoutes = require('./routes/tutorialsRoute');

app.use('/accounts', accountsRoutes);
app.use('/companies',companiesRoutes);
app.use('/academics',academicsRoutes);
app.use('/agents',agentsRoutes);
app.use('/general',generalRoutes);
app.use('/errors', errorsRoutes);
app.use('/', accountsRoutes);

app.use('/tutorial', tutorialRoutes);

sequelize.sync().then(result=>{
    app.listen(process.env.port);
  }).catch(err=>{
    console.log(err);
});