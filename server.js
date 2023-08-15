const express = require('express');
const app=express();
const port = 3000;

const SurveyRoutes=require('./routes/Survey')


app.use(express.json());


app.use('/Survey',SurveyRoutes);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})