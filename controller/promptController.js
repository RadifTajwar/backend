const express = require('express');
const bodyParser = require('body-parser');
const catchAsyncError = require('../middleware/catchAsyncError');
const fs = require('fs');
const path = require('path');
// Replace with your actual API key fetching mechanism (e.g., environment variable)
const GOOGLE_API_KEY = process.env.gemini;

// Error handling (consider a more robust error handling approach)
if (!GOOGLE_API_KEY) {
  throw new Error('Missing Google API key. Please set the GOOGLE_API_KEY environment variable.');
}

// Initialize chat history and model (outside the request handler for efficiency)
let chatHistory = [];

const { GoogleGenerativeAI } = require('@google/generative-ai'); // Assuming the correct package name

const genAI = new GoogleGenerativeAI(process.env.gemini);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });



async function continueConversation(prpt) {

    const prewrittenPrompts = [
      "i want you to be my prompt engineer for my children story book where i will give you a topic about the story and you will generate me a story about that topic. But keep that in mind that i want the story to be written in simple words and also i want you name the characters in the story and the environment and the background scenario will also be somewhere in Bangladesh. Also i want the story to be small to be fitted in 10 lines and i want you to write the story in Aeshop's writing style. Don't make any conversation and the story will be viewed from a third person angle.The story should have a beginning scenario where you will describe some scenario about the characters and the environment around the characters, a climax part where the audience will be excited to know what is going to happen, their excitement, fear, anger will make the story a success and a ending part that describes the ending of the story.  Also the audience will be children so don't use any hard words that they fail to understand .You will use the places which are located in Bangladesh as almost all the audience will be from Bangladesh so that they become thrilled while reading this story book. And lastly your job is to iterate multiple times with your algorithm so that you make the best output from you and choose which story would be best fit for the audience.Also note that the story should be short written 7 lines it is important. Do you get what i said?Reply in yes or no",
     
      ` Create a story for my children's storybook about ${prpt}. Always ensure the audience is amused by the story. The climax should be the most exciting part. Avoid conversations between characters.note that the story should be short written 7 lines it is important and use longer lines..If  the user haven't mentioned any country name then You will use the places which are located in Bangladesh as almost all the audience will be from Bangladesh so that they become thrilled while reading this story book`,
      "Now, identify hard words that the audience might fail to understand. Create a list of these words as the audience will be aged 2 to 5. Replace these words with easier alternatives that young children will understand.",

        `Now create a Javascript array named 'story_scenario'.Just give me the array object 'story_scenario' in Javascript format. Do not say anything else.Also create a title of the story and give me the title as a javascript string called "Title" and the "Title" would be in these format "Title" = "/title_text/"`
      
      ];
  let lastResponse = null;

  // Use the existing chat history (no need to start a new chat)
  const chat = await model.startChat({ history: chatHistory });

  for (const prompt of prewrittenPrompts) {
    console.log(prompt);

    // Send pre-written prompt to the model within the existing chat
    const result = await chat.sendMessage(prompt);
    const response = await result.response;

    // Update the chat history within the existing chat
    chatHistory = chat.history;

    // Store the response
    lastResponse = response.text();
    console.log(lastResponse);
  }

  return lastResponse;
}

exports.promptGenerate = catchAsyncError(async (req, res, next) => {
  // Continue the conversation based on pre-written prompts
  const prpt= req.body.prompt;
  const lastResponse = await continueConversation(prpt);
    console.log(lastResponse);

  res.status(200).json({ success: lastResponse });
});

async function storyGeneration(prpt) {

  const prewrittenPrompts = [
    "'A brave mouse who dreams of being a knight.','A magical journey awaits when a clumsy bear discovers the power of flight.','A brave mouse embarks on a magical adventure to find the mysterious Rainbow Valley.','A magical dragon who flies to school each day.','A strange journey begins when a young kangaroo discovers a magical portal.'  Here are some of the prompt a user will write to a ai bot to create a story about these.if i was the user and i wanted to write something like this lines but i want you to help me generate something like this lines what would be the prompt i would give you so that you would generate me a line some thing like these lines,detect the hard words from the prompt and use easier words to replace those hard words which will be understood by the children of age 4 to 6 years old.Also you need to include characters name from Bangladesh and also the the background scenario will also be from Bangladesh. Now give me only any single line that i will directly use as my prompt don't give anything except a single line"
    ];
let lastResponse = null;

// Use the existing chat history (no need to start a new chat)
const chat = await model.startChat({ history: chatHistory });

for (const prompt of prewrittenPrompts) {
  console.log(prompt);

  // Send pre-written prompt to the model within the existing chat
  const result = await chat.sendMessage(prompt);
  const response = await result.response;

  // Update the chat history within the existing chat
  chatHistory = chat.history;

  // Store the response
  lastResponse = response.text();
  console.log(lastResponse);
}

return lastResponse;
}


exports.sotryBeginingFromUser = catchAsyncError(async (req, res, next) => {

  const lastResponse = await storyGeneration();

  res.status(200).json({ story: lastResponse });
});



exports.storyLines = catchAsyncError(async (req, res, next) => {
  // Get the title and id from the request body
  const { title, id } = req.body;

  // Define the path to the text file
  const filePath = path.join(__dirname, `../../FrontEnd/public/story/user/${title}/lines/${id}.txt`);

  // Read the content of the text file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ error: 'Error reading file' });
    }

    // Send the file content as a response
    res.status(200).json({ title, id, fileContent: data });
  });
});