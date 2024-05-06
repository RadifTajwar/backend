const express = require('express');
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const fs = require('fs');
const axios = require('axios');
const catchAsyncError = require('../middleware/catchAsyncError');
// Replace with your actual API key fetching mechanism (e.g., environment variable)
const GOOGLE_API_KEY = process.env.gemini;

// Error handling (consider a more robust error handling approach)
if (!GOOGLE_API_KEY) {
    throw new Error('Missing Google API key. Please set the GOOGLE_API_KEY environment variable.');
}

// Initialize chat history and model (outside the request handler for efficiency)
let chatHistory = [];

const { GoogleGenerativeAI } = require('@google/generative-ai'); // Assuming the correct package name
const { title } = require('process');

const genAI = new GoogleGenerativeAI(process.env.gemini);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

exports.voiceGenerate = catchAsyncError(async (req, res, next) => {
    // Assuming the text is sent in the request body under a key named 'text'
    const text = req.body.text;
    const voiceId = req.body.voiceId;
    const storyTitle = req.body.title;
    if (!text) {
        return res.status(400).json({ error: 'Text is required in the request body' });
    }

    // Directory where audio files will be saved
    const directory = `../FrontEnd/public/story/user/${storyTitle}/speeches`;
    
    const filePath = `../FrontEnd/public/story/user/${storyTitle}/lines`;

    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
    }
    var lineFile = `${filePath}/${voiceId}.txt`;
    fs.writeFile(lineFile, text, (err) => {
        if (err) {
          console.error('Error writing file:', err);
          // Handle error
        } else {
          console.log('Text saved to file:', lineFile);
          // File saved successfully
        }
      });


    // Ensure the directory exists, create it if it doesn't
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    var audioFile = `${directory}/${voiceId}.wav`;
    // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
    const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.speech_subscription_key, process.env.speech_region);
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

    // The language of the voice that speaks.
    speechConfig.speechSynthesisVoiceName = "en-US-AndrewMultilingualNeural";

    // Create the speech synthesizer.
    var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    // Start the synthesizer and wait for a result.
    synthesizer.speakTextAsync(text,
        function (result) {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                console.log("Synthesis finished.");
                res.status(200).json({ success: '200' });
            } else {
                console.error("Speech synthesis canceled, " + result.errorDetails +
                    "\nDid you set the speech resource key and region values?");
            }
            synthesizer.close();
            synthesizer = null;
        },
        function (err) {
            console.trace("Error - " + err);
            synthesizer.close();
            synthesizer = null;
        });

    console.log("Now synthesizing to: " + audioFile);

});


async function imagePromptGeneration(story, prpt) {

    const prewrittenPrompts = [
        ` ${story}
        From this story i will be using these line "
         ${prpt}
        "
        In stable diffusion to create a image. Now you as my prompt engineer will generate a prompt that will tell about the characters and their doings first and then tell a short brief about the scenario in where the characters are placed in . The character will be recognized by their features not by their name. You as my prompt engineer will be iteratively revise your prompt and will give me a single prompt which you think will be best for Stable Diffusion text to image input prompt .

        Here are two style for creating any prompt
        
        1) {{Prompt}}, shot 35 mm, realism, octane render, 8k, trending on artstation, 35 mm camera, unreal engine, hyper detailed, photo - realistic maximum detail, volumetric light, realistic matte painting, hyper photorealistic, trending on artstation, ultra - detailed, realistic
        2) {{Prompt}}, anthro, very cute kid's film character, disney pixar zootopia character concept artwork, 3d concept, detailed fur, high detail iconic character for upcoming film, trending on artstation, character design, 3d artistic render, highly detailed, octane, blender, cartoon, shadows, lighting
        3) {{Prompt}}, epic concept art by barlowe wayne, ruan jia, light effect, volumetric light, 3d, ultra clear detailed, octane render, 8k, dark green, {{colors}} colour scheme
        You can choose any of the prompt style or mix prompt style as you prefer to make a perfect short prompt for stable diffusion`,
        "Now you will give me the prompt string as string named 'prompt' and the style string as string named 'style' and give it in this format 'prompt'='prompt_txt' and 'style'='style_text' "
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

exports.imageGenerate = catchAsyncError(async (req, res, next) => {
    const story = req.body.story;
    const text = req.body.text;
    const id = req.body.id;
    const storyTitle=req.body.title;
    if (!text) {
        return res.status(400).json({ error: 'Text is required in the request body' });
    }

    const reply = await imagePromptGeneration(story, text);
    console.log(reply);
    const promptRegex = /prompt='(.*?)'/;
    const styleRegex = /style='(.*?)'/;
    // Extracting the prompt value using match function
    const matchPrompt = reply.match(promptRegex);
    const matchStyle = reply.match(styleRegex);

    const promptValue = matchPrompt[1];

    const styleValue = matchStyle[1];

    const prompt = `{{${promptValue}}},${styleValue}`
    


    const requestBody = {
        prompt: prompt,
        steps: 50
    };

    // Make a POST request to localhost:7860
    try {
        const response = await axios.post('http://localhost:7860/sdapi/v1/txt2img', requestBody);
        const base64Image = response.data.images[0];
        const imageData = Buffer.from(base64Image, 'base64');
        const directory = `../FrontEnd/public/story/user/${storyTitle}/images`;

        // Ensure the directory exists, create it if it doesn't
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        var fileName = `${directory}/${id}.jpg`;

        fs.writeFile(fileName, imageData, 'binary', (err) => {
            if (err) {
                console.error('Error saving image:', err);
                res.status(500).json({ error: 'Error saving image' });
            } else {
                console.log('Image saved successfully:', fileName);
                res.status(200).json({ success: '200', fileName: fileName });
            }
        });
    } catch (error) {
        console.error('Error making POST request to localhost:7860:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});