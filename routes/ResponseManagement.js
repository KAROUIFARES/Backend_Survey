
const express = require('express');
const { readFile } = require('fs');
const fs = require('fs').promises;
const path = require('path');
const app = express.Router();


app.use(express.json());

const Directory="./Data/";
var UserRponseData;
var DashbordData;
var EssaiData;


//   const readEssaiData=(callback)=>{
//     fs.readFile(EssaiData,'utf8',(err,data)=>{
//       if(err){
//       if (err.code === 'ENOENT') {
//         callback(null,[]);
//       }else{
//         console.error('Error reading from the file:',err);
//         callback(err);
//       }
//     }else{
//         try{
//           const jsonData=JSON.parse(data);
//           callback(null,jsonData);
//         }catch(parseErr){
//           console.error('Error parsing existing data:',parseErr);
//           callback(parseErr);
//         }
//     }
//     });
//   }


  const readUserReponse = (callback) => {
    fs.readFile(UserRponseData, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          callback(null, []);
        } else {
          console.error('Error reading from the file:', err);
          callback(err);
        }
      } else {
        try {
          const jsonData = JSON.parse(data);
          callback(null, jsonData);
        } catch (parseErr) {
          console.error('Error parsing existing data:', parseErr);
          callback(parseErr);
        }
      }
    });
  };
  
  const readDashbordData=(callback) =>{
    fs.readFile(DashbordData, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          callback(null, []);
        } else {
          console.log('Error reading from file:', err);
          callback(err);
        }
      } else {
        try {
          const jsonData = JSON.parse(data);
          callback(null, jsonData);
        } catch (parseErr) {
          console.log('Error parsing existing data:', parseErr);
          callback(parseErr);
        }
      }
    });
  }
  
  const saveDashbordData=(data, callback)=>{
      readDashbordData((readErr, dashboardData) => {
        if (readErr) {
          console.error('Error reading dashboard data:', readErr);
          callback(readErr);
          return;
        }
    
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          const foundData = dashboardData.find((dashboardItem) =>
            dashboardItem.question.QuestionRank === item.QuestionRank
          );
    
          if (foundData) {
            foundData.question.nbreponse = (foundData.question.nbreponse || 0) + 1;
            for (const responseLabel of item.reponse) {
              const foundResponse = foundData.response.find(
                (responseItem) => responseItem.Label === responseLabel
              );
    
              if (foundResponse) {
                foundResponse.Value++;
              }
            }
          }
        }
    
        const jsonData = JSON.stringify(dashboardData, null, 2);
    
        fs.writeFile(DashbordData, jsonData, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('Error writing to the file:', writeErr);
            callback(writeErr);
          } else {
            console.log('Dashboard data saved successfully!');
            callback(null);
          }
        });
      });
    }
    
  
  
  /**
   * Questionnaire API 
   * readData ==> Lire tous les questionnaires
   * readData/:id ==> lire un questionnaire avec id
   * writeData ==> l'insertion d'un questionnaire 
   */
  app.get('/readData', (req, res) => {
    ReadQuesData((err, jsonData) => {
      if (err) {
        res.status(500).json({ error: 'Error reading from the file', err });
      } else {
        res.json(jsonData);
      }
    });
  });
    
  /**
   * UserReponse API 
   * 
   * 
   * StoreUserReponse ==> l'insertion des Reponse d'un utlisateur 
   */
  app.post('/StoreUserReponse', (req, res) => {
    const newData = req.body.response;
    const SurveyTitle=req.body.SurveyTitle
    const vague=res.body.vague
    UserRponseData=path.join(Directory,SurveyTitle,vague,"UserResponse.json")
    DashbordData=path.join(Directory,SurveyTitle,vague,"Dashbord.json")
    readUserReponse((err, dataArray) => {
      if (err) {
        return res.status(500).json({ error: 'Error reading from the file', err });
      }
      dataArray.push(newData);
      const jsonData = JSON.stringify(dataArray, null, 2);
      fs.writeFile(UserRponseData, jsonData, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Error writing to the file:', writeErr);
          res.status(500).json({ error: 'Error writing to the file', writeErr });
        } else {
          res.json({ message: 'Data saved successfully' });
          saveDashbordData(newData);
        }
      });
    });
  });
  /**
   * Essai API 
   * 
   * 
   * CreateEssai ==> l'insertion d'un essai
   */
  app.post('/CreateEssai', (req, res) => {
    const newData = req.body.response;
    const SurveyTitle=req.body.SurveyTitle
    const vague=res.body.vague
    EssaiData=path.join(Directory,SurveyTitle,vague,"Essai.json")

    readEssaiData((err, dataArray) => {
      if (err) {
        return res.status(500).json({ error: 'Error reading from the file', err });
      }
      dataArray.push(newData);
      const jsonData = JSON.stringify(dataArray, null, 2);
  
      fs.writeFile(EssaiData, jsonData, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error('Error writing to the file:', writeErr);
          res.status(500).json({ error: 'Error writing to the file', writeErr });
        } else {
          console.log('Data saved successfully!');
          res.json({ message: 'Data saved successfully' });
        }
      });
    });
  });
  app.put('/InsertUserEmail/:id', (req, res) => {
    const newEmail = req.body.UserEmail;
    const id = req.params.id;
    const SurveyTitle=req.body.SurveyTitle
    const vague=res.body.vague
    EssaiData=path.join(Directory,SurveyTitle,vague,"Essai.json")
    
    readEssaiData((err, dataArray) => {
      if (err) {
        return res.status(500).json({ error: 'Error reading from the file', err });
      }
      const userIndex = dataArray.findIndex(item => item._id === id);
      if (userIndex !== -1) {
        dataArray[userIndex].UserEmail = newEmail;
        const jsonData = JSON.stringify(dataArray, null, 2);
        fs.writeFile(EssaiData, jsonData, 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('Error writing to the file:', writeErr);
            res.status(500).json({ error: 'Error writing to the file', writeErr });
          } else {
            console.log('Data saved successfully!');
            res.json({ message: 'Data saved successfully' });
          }
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    });
  });
  
  app.get('/readDashBordData', (req, res) => {
    readDashbordData((err, jsonData) => {
      if (err) {
        res.status(500).json({ error: 'Error reading from the file', err });
      } else {
        console.log(jsonData)
        res.json(jsonData);
      }
    });
  });
  module.exports=app