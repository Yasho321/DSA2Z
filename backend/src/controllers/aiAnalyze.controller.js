 import { GoogleGenAI } from "@google/genai";
import { text } from "express";
import { db } from "../libs/db.js";
export const aiAnalyze = async (req, res) =>{
    try {
        const {source_code,description} = req.body;
   

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const codePrompt = `
    You're an expert software engineer.

    Your analysis should focus solely on the main function implementing the algorithm/solution:

    Please analyze this code:
    - Explain what the function does
    - Rate the code out of 100 
    - Detect any bugs or edge cases
    - Give time and space complexity 
    - Suggest improvements (in time complexity, space complexity , readability)

    Please analyze the *core function* in this code only — ignore any input/output handling or setup logic.

    




    Analyze  the core solution function  and provide a JSON object with:

    - description : A short 1-2 sentence summary of the code what it does.
    - rating : A rating out of 100 for the code quality(keeping in mind time complexity , space complexity , readablity) of the core function.
    - bugs: bugs or edge cases detected in the code of the core function.
    - tc&sc: Give time and space complexity of the code of the core function.
    - improvement: suggest improvements in the code on the basis of time complexity, space complexity and readability of the core function.

    Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

    {
    "description": "Short summary of the code",
    "rating": 75,
    "bugs": "Here are bugs and edge cases you can fix ...",
    "tc&sc": "Time complexity: O(n), Space complexity: O(1)",
    "improvement": "Here are some suggestions to improve the code"
    }

    --- 

    IMPORTANT:
        - Respond with *only* valid raw JSON.
        - Do NOT include markdown, code fences, comments, or any extra formatting.
        - The format must be a raw JSON object.

        Repeat: Do not wrap your output in markdown or code fences.

    

    Code:
    ${source_code}

    Problem description : 
    ${description}

    IMPORTANT:
    - Respond with *only* valid raw JSON.
    - Do NOT include markdown, code fences, comments, or any extra formatting.
    - The format must be a raw JSON object.

    Repeat: Do not wrap your output in markdown or code fences.
    `;

    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
            role : "user",
            parts : [{text: codePrompt}],
        }],
    });
    
    const raw = response.text;
    const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
    const jsonString = match ? match[1] : raw.trim();
    const json = JSON.parse(jsonString);

    await db.user.update({
        where: { id: req.user.id },
        data: { tokens: { decrement: 1 } },
    });

    res.status(200).json(json);
    
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success : false ,
            message: "Error analyzing code",

        })
        
    }
   

    

}
