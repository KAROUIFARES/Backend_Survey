const express = require('express');
const cors = require('cors'); // Import the cors middleware

const app=express();
const port = 3000;

const SurveyRoutes=require('./routes/Survey')
const UserRoutes=require('./routes/User.js')
const ResponseManagement=require('./routes/ResponseManagement.js')
app.use(express.json());
app.use(cors());

app.use('/RM',ResponseManagement)
app.use('/Survey',SurveyRoutes);
app.use('/user',UserRoutes);
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})