const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Branding and Watermark Configuration
const BRANDING = {
    developed_by: "Ramzan Ahsan",
    group_link: "https://chat.whatsapp.com/LoafyPWMGOv88oElxdwOB8"
};

// Hardcoded API Keys System
const VALID_KEYS = {
    "ramzan-7day-demo-key-xyz": { type: "7 Days", expires: "2026-06-20" },
    "ramzan-1month-premium-abc": { type: "1 Month", expires: "2026-07-13" },
    "ramzan-1year-vip-gold": { type: "1 Year", expires: "2027-06-13" }
};

const MODELS_REGISTRY = {
    "gemini-flash": { type: "chat", description: "Gemini 2.5 Flash Engine via bot-hosting" },
    "gemini-prime": { type: "chat", description: "Gemini 3 Flash via Primezone Vercel route" },
    "gpt-5-nano": { type: "chat", description: "GPT-5 Nano Engine optimization route" },
    "deepseek": { type: "chat", description: "DeepSeek Intelligent LLM routing" },
    "claude-opus": { type: "chat", description: "Claude Opus 4.7 premium model via Klyphic proxy" },
    "llama3.2": { type: "chat", description: "Ollama Llama3.2 Latest execution layer" },
    "llava": { type: "chat", description: "Llava Vision/Chat structural inference model" },
    "smollm2": { type: "chat", description: "SmolLM2 135m compact responsive model" },
    "wormgpt": { type: "chat", description: "WormGPT raw logic output filter layer" },
    "sora2-video": { type: "video", description: "Sora2 Text to Video Engine. Needs prompt parameter" },
    "text-to-video-six": { type: "video", description: "Alternative text-to-video processing node" },
    "veo-image": { type: "image", description: "Veo Premium structural image constructor" },
    "dalle": { type: "image", description: "Dall-E Neural Network generator pipeline" },
    "nanobanana": { type: "image", description: "NanoBanana Pro image engine wrapper" },
    "gpt-image": { type: "image", description: "GPT Image Generation Node v2" },
    "nano-banana2": { type: "image", description: "Nano Banana 2 alternate path render node" },
    "flip-gen": { type: "image", description: "Flip Gen engine with Style path injections. Param: style" },
    "flux-cyberpunk": { type: "image", description: "Flux Model engine loaded with futuristic retro preset" },
    "sdxl-watercolor": { type: "image", description: "SDXL High detail watercolor dynamic painting array" }
};

function authorizeKey(req, res, next) {
    const userKey = req.query.key || req.body.key;
    if (!userKey) {
        return res.status(401).json({ status: "failed", error: "API Key missing. Pass '?key=YOUR_KEY' in route parameters.", ...BRANDING });
    }
    if (!VALID_KEYS[userKey]) {
        return res.status(403).json({ status: "failed", error: "Invalid API key or license expired.", ...BRANDING });
    }
    next();
}

async function uploadToTmpStorage(base64OrBufferOrUrl, inputType = "buffer") {
    try {
        let fileBuffer;
        if (inputType === "url") {
            const downloadRes = await axios.get(base64OrBufferOrUrl, { responseType: 'arraybuffer', timeout: 20000 });
            fileBuffer = Buffer.from(downloadRes.data);
        } else if (inputType === "base64") {
            fileBuffer = Buffer.from(base64OrBufferOrUrl, 'base64');
        } else {
            fileBuffer = base64OrBufferOrUrl;
        }

        const filename = `${uuidv4().replace(/-/g, '')}.png`;
        const form = new FormData();
        form.append('file', fileBuffer, { filename, contentType: 'image/png' });

        const response = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
            headers: form.getHeaders(),
            timeout: 30000
        });

        if (response.data && response.data.status === "success") {
            return response.data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
        }
    } catch (e) {
        console.error("⚠️ Secure Cloud Upload failed:", e.message);
    }
    return base64OrBufferOrUrl;
}

async function sendStandardizedResponse(res, modelName, rawResult) {
    let finalizedResult = rawResult;
    if (typeof rawResult === 'string' && rawResult.startsWith('http://')) {
        finalizedResult = await uploadToTmpStorage(rawResult, "url");
    }
    return res.json({
        status: "success",
        model: modelName,
        result: finalizedResult,
        ...BRANDING
    });
}

// 1. Endpoint: Documentation Route (/api/models)
app.get('/api/models', (req, res) => {
    res.json({
        status: "success",
        total_models: Object.keys(MODELS_REGISTRY).length,
        models: MODELS_REGISTRY,
        ...BRANDING
    });
});

// 2. Main Entrypoint: Dynamic Unified Route (/api/chat)
app.all('/api/chat', authorizeKey, async (req, res) => {
    const params = req.method === 'POST' ? req.body : req.query;
    const chosenModel = params.model;
    let prompt = params.text || params.prompt || params.q;
    const customStyle = params.style || "realistic";

    if (!chosenModel) {
        return res.status(400).json({ status: "failed", error: "Please provide a 'model' parameter.", ...BRANDING });
    }
    if (!prompt) {
        return res.status(400).json({ status: "failed", error: "Input instruction parameter is required.", ...BRANDING });
    }

    const modelKey = chosenModel.toLowerCase();

    try {
        switch (modelKey) {
            
            // ==================== CHAT MODELS WITH PROMPT ISOLATION ====================
            case "gemini-flash": {
                // System Instruction injection to prevent model identity theft/mixing
                const strictPrompt = `[System Instruction: You are Gemini 2.5 Flash, an AI built by Google. Never claim to be Llama, ChatGPT, or Meta. Answer the following user question strictly as Gemini 2.5 Flash]. User Question: ${prompt}`;
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-chat?text=${encodeURIComponent(strictPrompt)}`, { timeout: 15000 });
                return sendStandardizedResponse(res, "Gemini 2.5 Flash", response.data.reply || response.data.response);
            }

            case "gemini-prime": {
                const response = await axios.get(`https://gemini-primezone.vercel.app/?q=${encodeURIComponent(prompt)}`, { timeout: 15000 });
                return sendStandardizedResponse(res, "Gemini 3 Flash", response.data.response || response.data.reply);
            }

            case "gpt-5-nano": {
                const strictPrompt = `[System Instruction: You are GPT-5 Nano, developed by OpenAI. Keep your identity precise.] User Question: ${prompt}`;
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-chatgpt?text=${encodeURIComponent(strictPrompt)}`, { timeout: 15000 });
                return sendStandardizedResponse(res, "GPT-5 Nano", response.data.reply);
            }

            case "deepseek": {
                const strictPrompt = `[System Instruction: You are DeepSeek, an AI model built by DeepSeek company.] User Question: ${prompt}`;
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-deepseek?uid=12345&text=${encodeURIComponent(strictPrompt)}`, { timeout: 15000 });
                return sendStandardizedResponse(res, "DeepSeek", response.data.reply);
            }

            case "claude-opus": {
                const response = await axios.get(`https://klyphic.onrender.com/chat?token=033b3b43aa3d4c93bb0952161c0df3a7&q=${encodeURIComponent(prompt)}&model=claude-opus-4.7`, { timeout: 15000 });
                return sendStandardizedResponse(res, "Claude Opus 4.7", response.data.response);
            }

            case "llama3.2": {
                const response = await axios.post("http://108.181.196.208:11434/api/chat", {
                    model: "llama3.2:latest",
                    messages: [{ role: "user", content: prompt }],
                    stream: false
                }, { timeout: 20000 });
                return sendStandardizedResponse(res, "Llama 3.2 Latest", response.data.message.content);
            }

            case "llava": {
                const response = await axios.post("http://108.181.196.208:11434/api/chat", {
                    model: "llava:latest",
                    messages: [{ role: "user", content: prompt }],
                    stream: false
                }, { timeout: 25000 });
                return sendStandardizedResponse(res, "Llava Vision AI", response.data.message.content);
            }

            case "smollm2": {
                const response = await axios.post("http://108.181.196.208:11434/api/chat", {
                    model: "smollm2:135m",
                    messages: [{ role: "user", content: prompt }],
                    stream: false
                }, { timeout: 15000 });
                return sendStandardizedResponse(res, "SmolLM2 135m", response.data.message.content);
            }

            case "wormgpt": {
                const response = await axios.get(`https://wormgpt.freeapihub.workers.dev/chat?q=${encodeURIComponent(prompt)}`, { timeout: 15000 });
                return sendStandardizedResponse(res, "WormGPT Enterprise", response.data.reply || response.data.response);
            }

            // ==================== VIDEO MODELS ====================
            case "sora2-video": {
                const response = await axios.post("https://zecora0.serv00.net/ai/Sora2_s4.php", {
                    prompt: prompt,
                    aspect: "16:9"
                }, { headers: { "Content-Type": "application/json" }, timeout: 45000 });
                return sendStandardizedResponse(res, "Sora2 AI Video Engine", response.data.UrlVideo);
            }

            case "text-to-video-six": {
                const response = await axios.get(`https://texttovideo-six.vercel.app/generate?prompt=${encodeURIComponent(prompt)}`, { timeout: 45000 });
                return sendStandardizedResponse(res, "Sora Vercel Multi-node Six", response.data.url);
            }

            // ==================== IMAGE MODELS ====================
            case "veo-image": {
                const pageData = await axios.get("https://veoaifree.com/veo-video-generator/", { timeout: 15000 });
                let nonce = null;
                const match = pageData.data.match(/"nonce"\s*:\s*"([a-zA-Z0-9]+)"/);
                if (match) nonce = match[1];
                if (!nonce) throw new Error("Veo API token mismatch.");
                
                const payload = new URLSearchParams();
                payload.append("action", "veo_video_generator");
                payload.append("nonce", nonce);
                payload.append("promptText", prompt);
                payload.append("totalImages", "1");
                payload.append("ratio", "IMAGE_ASPECT_RATIO_PORTRAIT");
                payload.append("actionType", "whisk_final_image");
                payload.append("model", "veo");

                const imgResponse = await axios.post("https://veoaifree.com/wp-admin/admin-ajax.php", payload, { timeout: 35000 });
                let base64Uri = imgResponse.data.data?.data_uri || imgResponse.data.data_uri || "";
                if (base64Uri.includes("base64,")) base64Uri = base64Uri.split("base64,")[1];

                const secureLink = await uploadToTmpStorage(base64Uri, "base64");
                return sendStandardizedResponse(res, "Veo Image Generator Engine", secureLink);
            }

            case "dalle": {
                const response = await axios.post("https://yabes-api.pages.dev/api/ai/image/dalle", { prompt: prompt }, { timeout: 30000 });
                return sendStandardizedResponse(res, "Dall-E AI Node", response.data.output);
            }

            case "nanobanana": {
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-nanobanana-pro?text=${encodeURIComponent(prompt)}`, { timeout: 20000 });
                return sendStandardizedResponse(res, "KILWA Nanobanana Pro", response.data.image_url);
            }

            case "gpt-image": {
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-gpt-img?text=${encodeURIComponent(prompt)}`, { timeout: 20000 });
                return sendStandardizedResponse(res, "GPT Image 2 Node System", response.data.image_url);
            }

            case "nano-banana2": {
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-img?text=${encodeURIComponent(prompt)}`, { timeout: 20000 });
                return sendStandardizedResponse(res, "Nano Banana Engine Gen 2", response.data.image_url);
            }

            case "flip-gen": {
                const response = await axios.get(`https://flip-gen.vercel.app/ai/image/${customStyle}?prompt=${encodeURIComponent(prompt)}`, { timeout: 25000 });
                return sendStandardizedResponse(res, `Flip-Gen [Style: ${customStyle}]`, response.data.image_url);
            }

            case "flux-cyberpunk": {
                const response = await axios.post("https://image.itz-ashlynn.workers.dev/generate", {
                    prompt: prompt,
                    version: "flux",
                    style: "futuristic_retro_cyberpunk"
                }, { responseType: 'arraybuffer', timeout: 35000 });

                const secureLink = await uploadToTmpStorage(response.data, "buffer");
                return sendStandardizedResponse(res, "Flux Cyberpunk Neural Engine", secureLink);
            }

            case "sdxl-watercolor": {
                const response = await axios.post("https://image.itz-ashlynn.workers.dev/generate", {
                    prompt: prompt,
                    version: "sdxl",
                    style: "watercolor"
                }, { responseType: 'arraybuffer', timeout: 35000 });

                const secureLink = await uploadToTmpStorage(response.data, "buffer");
                return sendStandardizedResponse(res, "SDXL High Fidelity Watercolor Studio", secureLink);
            }

            default:
                return res.status(404).json({ status: "failed", error: `Model key '${chosenModel}' not found.`, ...BRANDING });
        }

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            error: "Internal pipeline error or target host downtime.",
            technical_details: error.message,
            ...BRANDING
        });
    }
});

app.use((req, res) => {
    res.status(404).json({ status: "failed", error: "Valid endpoints: /api/models, /api/chat", ...BRANDING });
});

module.exports = app;
