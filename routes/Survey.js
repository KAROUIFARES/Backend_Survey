const express = require('express');
const { readFile } = require('fs');
const fs = require('fs').promises;
const path = require('path');
const app = express.Router();

const DataFolderPath = './Data/';

app.use(express.json()); // Parse JSON request body
async function deleteDirectory(dirPath) {
  try {
    await fs.rmdir(dirPath, { recursive: true }); // Recursively delete the directory and its contents
    console.log(`Directory ${dirPath} deleted successfully.`);
  } catch (err) {
    console.error(`Error deleting directory ${dirPath}:`, err);
  }
}


app.put('/UpdateSurveyState', async (req, res) => {
  try {
    const SurveyTitle = req.body.SurveyTitle;
    const surveyState = req.body.SurveyState;
    const filePath = path.join(DataFolderPath, 'Allsurvey.json');
    const data = await fs.readFile(filePath, 'utf8');
    const SurveyList = JSON.parse(data);
    const index = SurveyList.findIndex((item) => item.SurveyTitle === SurveyTitle);
    if (index !== -1) {
      SurveyList[index].State = surveyState;
      await fs.writeFile(filePath, JSON.stringify(SurveyList, null, 2), 'utf8');

      res.status(200).json({ success: true, message: 'Survey state updated successfully'});
    } else {
      res.status(404).json({ success: false, message: 'Survey not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/DeleteSurvey', async (req, res) => {
  try {
    const SurveyTitle = req.body.SurveyTitle;
    const AllsurveyFilePath = path.join(DataFolderPath, 'Allsurvey.json');
    const directoryPath = path.join(DataFolderPath, SurveyTitle);

    // Read the existing survey data
    const existingSurveysData = JSON.parse(await fs.readFile(AllsurveyFilePath, 'utf8'));

    // Find the survey index by SurveyTitle
    const index = existingSurveysData.findIndex((item) => item.SurveyTitle === SurveyTitle);

    if (index !== -1) {
      // Remove the survey from the list
      existingSurveysData.splice(index, 1);

      // Update the Allsurvey.json file
      await fs.writeFile(AllsurveyFilePath, JSON.stringify(existingSurveysData, null, 2), 'utf8');

      // Call the deleteDirectory function to delete the survey directory
      await deleteDirectory(directoryPath);

      res.status(200).json({ message: 'Survey deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Survey not found' });
    }
  } catch (err) {
    console.error('Error deleting survey:', err);
    res.status(500).json({ error: 'Failed to delete survey' });
  }
});

app.post('/CreateSurvey', async (req, res) =>
{
  try
  {
    const surveyData = req.body;
    const folderName = path.join(DataFolderPath, surveyData.SurveyTitle);
    await fs.mkdir(folderName);
    const CustomerFile = path.join(folderName, 'Customer.json');
    await fs.writeFile(CustomerFile, '[]');
    const DashFile = path.join(folderName, 'Dash0.json');
    await fs.writeFile(DashFile, '[]');
    const AllsurveyFilePath = path.join(DataFolderPath, 'Allsurvey.json');
    const existingSurveysData = JSON.parse(await fs.readFile(AllsurveyFilePath, 'utf8'));
    existingSurveysData.push(surveyData);
    await fs.writeFile(AllsurveyFilePath, JSON.stringify(existingSurveysData, null, 2));
    const QuestionFilePath = path.join(folderName, 'Question.json');
    await fs.writeFile(QuestionFilePath, '[]');
    res.status(200).json({ message: 'Survey folder and files created successfully.' });
  } catch (err)
  {
    console.error('Error creating survey:', err);
    res.status(500).json({ error: 'Failed to create survey folder and files.' });
  }
});

app.post('/InsertQuestion', async (req, res) =>
{
  try
  {
    const SurveyTitle = req.body.SurveyTitle;
    const Data = req.body.QuestionList;

    if (!SurveyTitle || !Data)
    {
      return res.status(400).json({ error: 'SurveyTitle and Data are required fields.' });
    }
    const surveyFolderPath = path.join(DataFolderPath, SurveyTitle);
    const fileName = path.join(surveyFolderPath, 'Question.json');
    await fs.writeFile(fileName, JSON.stringify(Data, null, 2));
    res.status(200).json({ message: 'Question data saved successfully.' });
  } catch (error)
  {
    console.error('Error inserting question:', error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});



app.post('/IsertDashbord', async (req, res) =>
{
  try
  {
    const SurveyTitle = req.body.SurveyTitle;
    const Data = req.body.dashbord;
    if (!SurveyTitle || !Data)
    {
      return res.status(400).json({ error: 'SurveyTitle and Data are required fields.' });
    }
    const fileName = path.join(DataFolderPath, SurveyTitle, 'Dash0.json');
    try
    {
      await fs.mkdir(path.join(DataFolderPath, SurveyTitle));
    } catch (mkdirErr)
    {
      if (mkdirErr.code !== 'EEXIST')
      {
        console.error('Error creating survey folder:', mkdirErr);
        return res.status(500).json({ error: 'Failed to create survey folder.' });
      }
    }
    await fs.writeFile(fileName, JSON.stringify(Data, null, 2));
    res.status(200).json({ message: 'dashbord data saved successfully.' });
  } catch (error)
  {
    console.error('Error inserting question:', error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

app.get('/getQuestion', (req, res) =>
{
  const SurveyTitle = req.body.SurveyTitle;
  const filePath = path.join(DataFolderPath, SurveyTitle, 'Question.json');

  fs.readFile(filePath, 'utf8')
    .then(data =>
    {
      try
      {
        const questionData = JSON.parse(data);
        res.status(200).json(questionData);
      } catch (parseError)
      {
        console.error('Error parsing JSON:', parseError);
        res.status(500).json({ error: 'Failed to parse JSON data.' });
      }
    })
    .catch(err =>
    {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Failed to read the file.' });
    });
});


app.post('/Createvague', async (req, res) =>
{
  const SurveyTitle = req.body.SurveyTitle;
  const filePath = path.join(DataFolderPath, SurveyTitle);
  const DashbordFilePath = path.join(filePath, 'Dash0.json');
  const SurveyFilePath = path.join(filePath, 'survey.json');
  fs.readFile(SurveyFilePath, 'utf8').then(data =>
  {
    try
    {
      const surveyData = JSON.parse(data);
      const vague = 'Vague' + (surveyData.nbVague + 1).toString();
      surveyData.nbVague++
      fs.writeFile(SurveyFilePath, JSON.stringify(surveyData, null, 2));

      const VagueFolderPath = path.join(filePath, vague);
      fs.mkdir(VagueFolderPath);


      fs.readFile(DashbordFilePath, 'utf8').then(dashData =>
      {
        const dashbord = JSON.parse(dashData);
        const DashbordVaguePath = path.join(VagueFolderPath, 'Dashbord.json');
        fs.writeFile(DashbordVaguePath, JSON.stringify(dashbord, null, 2));
      })

      const UserResponseFilePath = path.join(VagueFolderPath, 'UserResponse.json');
      fs.writeFile(UserResponseFilePath, '[]');

      res.status(200).json({ message: 'Vague Created successfully' })
    } catch (parseError)
    {
      console.error('Error parsing JSON:', parseError);
      res.status(500).json({ error: 'Failed to parse JSON data.' })
    }
  })
});

app.get('/getSurvyes', (req, res) =>
{
  const filePath = path.join(DataFolderPath,'Allsurvey.json');

  fs.readFile(filePath, 'utf8')
    .then(data =>
    {
      try
      {
        const questionData = JSON.parse(data);
        res.status(200).json(questionData);
      } catch (parseError)
      {
        console.error('Error parsing JSON:', parseError);
        res.status(500).json({ error: 'Failed to parse JSON data.' });
      }
    })
    .catch(err =>
    {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Failed to read the file.' });
    });
});

module.exports = app;
