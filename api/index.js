const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Branding and Watermark
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

// ALL MODELS REGISTRY FROM YOUR 17 POINTS
const MODELS_REGISTRY = {
    // Chat & Text Models
    "gemini-2.5-flash": { type: "chat", description: "Gemini 2.5 Flash Engine via Kilwa Server" },
    "gemini-3-flash": { type: "chat", description: "Gemini 3 Flash via Primezone Server" },
    "gpt-5-nano": { type: "chat", description: "GPT-5 Nano via Kilwa Server" },
    "deepseek": { type: "chat", description: "DeepSeek Intelligence Server" },
    "claude-opus-4.7": { type: "chat", description: "Claude Opus 4.7 premium via Klyphic Token System" },
    "llama3.2": { type: "chat", description: "Ollama Llama3.2:latest local framework engine" },
    "llava": { type: "chat", description: "Ollama Llava:latest vision capabilities intelligence" },
    "smollm2": { type: "chat", description: "Ollama SmolLM2:135m highly compressed chatbot" },
    "wormgpt": { type: "chat", description: "WormGPT unfiltered dark logic framework node" },

    // Video Generation Models
    "sora-video-six": { type: "video", description: "Text to Video Six Vercel Framework Engine" },
    "sora2-video": { type: "video", description: "Sora2 Premium AI Video Generator via zecora" },

    // Base Image Models
    "veo-image": { type: "image", description: "Veo AI Image Engine with automated dynamic Nonce scraping" },
    "dalle": { type: "image", description: "Dall-E Generator via Yabes API network" },
    "nanobanana-pro": { type: "image", description: "KILWA Nanobanana Pro High Speed Engine" },
    "gpt-image-2": { type: "image", description: "GPT Image 2 Node System Framework" },
    "nanobanana-2": { type: "image", description: "Nano Banana Gen 2 variant path" },

    // SDXL & FLUX Dedicated Array Engines
    "flux-cyberpunk": { type: "image", description: "Flux engine loaded with futuristic_retro_cyberpunk node" },
    "sdxl-watercolor": { type: "image", description: "SDXL engine configured with ultra watercolor array" },

    // Flip-Gen Core Engine & Its 31 Dedicated Dynamic Style Paths
    "flip-gen": { type: "image", description: "Base Flip-Gen Model (Pass standard prompt or append style parameter)" },
    "flip-realistic": { type: "image", description: "Flip-Gen: Realistic photo simulation" },
    "flip-anime": { type: "image", description: "Flip-Gen: Anime graphic design art style" },
    "flip-fantasy": { type: "image", description: "Flip-Gen: Fantasy world concept landscape generator" },
    "flip-cyberpunk": { type: "image", description: "Flip-Gen: Neon lights cyberpunk archetype filter" },
    "flip-watercolor": { type: "image", description: "Flip-Gen: Fluid abstract watercolor profile layout" },
    "flip-oil-painting": { type: "image", description: "Flip-Gen: Oil painting textured brush strokes filter" },
    "flip-pixel-art": { type: "image", description: "Flip-Gen: 8-bit retro gaming console pixel art asset" },
    "flip-sketch": { type: "image", description: "Flip-Gen: Hand-drawn pencil outline sketch style" },
    "flip-cartoon": { type: "image", description: "Flip-Gen: Standard vector animation cartoon layout" },
    "flip-abstract": { type: "image", description: "Flip-Gen: Modern non-representational abstract geometry art" },
    "flip-vintage": { type: "image", description: "Flip-Gen: Classic 1970s film grain vintage look" },
    "flip-steampunk": { type: "image", description: "Flip-Gen: Victorian steam engine copper industrial aesthetic" },
    
    // Additional 31 Styles mapped as direct accessible sub-models
    "style-adorable-kawaii": { type: "image", style_key: "adorable_kawaii", description: "Chibi kawaii clean vector profile artwork" },
    "style-pointillism": { type: "image", style_key: "pointillism", description: "Pointillism dots cluster art structure" },
    "style-psychedelic": { type: "image", style_key: "psychedelic", description: "Trippy vibrant high contrast colorful wave visual" },
    "style-typography": { type: "image", style_key: "typography", description: "Font integrated dynamic typographic painting architecture" },
    "style-caricature": { type: "image", style_key: "caricature", description: "Exaggerated humorous comic drawing style" },
    "style-colored-pencil": { type: "image", style_key: "colored_pencil_art", description: "Color pencil shaded sketch layout texture" },
    "style-monochrome": { type: "image", style_key: "monochrome", description: "Pure black and white depth cinematic photography representation" },
    "style-stained-glass": { type: "image", style_key: "stained_glass", description: "Church dynamic colorful glass segments mosaic" },
    "style-van-gogh": { type: "image", style_key: "van_gogh", description: "Starry night textured circular stroke paint simulation" },
    "style-comic": { type: "image", style_key: "comic", description: "Pop art book outline comic shaded look" },
    "style-manga": { type: "image", style_key: "manga", description: "Japanese standard black-ink high focus manga drawing asset" },
    "style-sumi-e": { type: "image", style_key: "sumi_e_symbolic", description: "Traditional Zen ink brush minimalism layout" },
    "style-surreal-painting": { type: "image", style_key: "surreal_painting", description: "Dream world landscape perspective physics distortion layout" },
    "style-papercraft-kirigami": { type: "image", style_key: "papercraft_kirigami", description: "Folded cut out paper layers landscape simulation" },
    "style-papercraft-mache": { type: "image", style_key: "papercraft_paper_mache", description: "Thick glued rough surface paper mache structural art" },
    "style-papercraft-quilling": { type: "image", style_key: "papercraft_paper_quilling", description: "Rolled spiraled thin paper strips pattern architecture" },
    "style-lowpoly": { type: "image", style_key: "lowpoly", description: "3D flat shading low polygon structural digital art" },
    "style-sticker": { type: "image", style_key: "sticker", description: "White outer boundary clean die-cut sticker layout asset" },
    "style-cubist": { type: "image", style_key: "cubist", description: "Pablo Picasso inspired broken multi angle geometric cubism art" },
    "style-dripping-paint": { type: "image", style_key: "dripping_paint_splatter", description: "Messy colorful canvas paint dripping splatter profile" },
    "style-ink-dripping": { type: "image", style_key: "ink_dripping", description: "Dark monochrome calligraphy ink drops spreading layout" },
    "style-alcohol-ink": { type: "image", style_key: "alcohol_ink", description: "Translucent abstract marble texture chemical blend layout" },
    "style-line-art": { type: "image", style_key: "line_art", description: "Single line continuous vector outline minimalistic drawing" },
    "style-tlingit-art": { type: "image", style_key: "tlingit_art", description: "Native American traditional symmetrical tribal carving art form" },
    "style-cross-stitching": { type: "image", style_key: "cross_stitching", description: "Fabric pixel cross thread stitch sewing matrix texture" },
    "style-pop-art": { type: "image", style_key: "pop_art", description: "Retro Andy Warhol comic grid dot coloring pattern visual" },
    "style-graffiti": { type: "image", style_key: "graffiti", description: "Urban street background spray paint wall tags artwork" },
    "style-fauvism": { type: "image", style_key: "fauvism", description: "Wild wild brushstrokes high saturation non-natural color spectrum art" }
};

// Middleware: API Key Validator
function authorizeKey(req, res, next) {
    const userKey = req.query.key || req.body.key;
    if (!userKey) {
        return res.status(401).json({ status: "failed", error: "API Key missing. Pass '?key=YOUR_KEY' inside parameters.", ...BRANDING });
    }
    if (!VALID_KEYS[userKey]) {
        return res.status(403).json({ status: "failed", error: "Invalid API key or license expired.", ...BRANDING });
    }
    next();
}

// Core Image Downloader & Buffer re-routing to HTTPS
async function uploadToTmpStorage(base64OrBufferOrUrl, inputType = "buffer") {
    try {
        let fileBuffer;
        if (inputType === "url") {
            // Buffer download timeout extended to 1.5 minutes (90000ms) to sync heavy inner endpoints
            const downloadRes = await axios.get(base64OrBufferOrUrl, { responseType: 'arraybuffer', timeout: 90000 });
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
            timeout: 90000 // Tmpfiles processing sync timeout set to 1m 30s
        });

        if (response.data && response.data.status === "success") {
            return response.data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
        }
    } catch (e) {
        console.error("⚠️ Tmpfiles cloud link processing system error:", e.message);
    }
    return base64OrBufferOrUrl;
}

// Automated Filter Layer: Catches raw HTTP, converts it safely using centralized pipeline
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

// 1. Documentation Route (/api/models)
app.get('/api/models', (req, res) => {
    res.json({
        status: "success",
        total_models: Object.keys(MODELS_REGISTRY).length,
        models: MODELS_REGISTRY,
        ...BRANDING
    });
});

// 2. Main Entrypoint Router Framework
app.all('/api/chat', authorizeKey, async (req, res) => {
    const params = req.method === 'POST' ? req.body : req.query;
    const chosenModel = params.model;
    let prompt = params.text || params.prompt || params.q;
    let fallbackStyle = params.style || "realistic";

    if (!chosenModel) {
        return res.status(400).json({ status: "failed", error: "Please declare target 'model' parameter inside context variables.", ...BRANDING });
    }
    if (!prompt) {
        return res.status(400).json({ status: "failed", error: "Input prompt/instruction query string is required.", ...BRANDING });
    }

    const modelKey = chosenModel.toLowerCase();

    try {
        switch (modelKey) {
            
            // --- CHAT MODELS HANDLERS ---
            case "gemini-2.5-flash":
            case "gemini-flash": {
                const strictPrompt = `[System Instruction: You are Gemini 2.5 Flash model built by Google. Keep identity safe.] Question: ${prompt}`;
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-chat?text=${encodeURIComponent(strictPrompt)}`, { timeout: 25000 });
                return sendStandardizedResponse(res, "Gemini 2.5 Flash", response.data.reply || response.data.response);
            }

            case "gemini-3-flash":
            case "gemini-prime": {
                const response = await axios.get(`https://gemini-primezone.vercel.app/?q=${encodeURIComponent(prompt)}`, { timeout: 25000 });
                return sendStandardizedResponse(res, "Gemini 3 Flash", response.data.response);
            }

            case "gpt-5-nano": {
                const strictPrompt = `[System Instruction: You are GPT-5 Nano built by OpenAI.] Question: ${prompt}`;
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-chatgpt?text=${encodeURIComponent(strictPrompt)}`, { timeout: 25000 });
                return sendStandardizedResponse(res, "GPT-5 Nano", response.data.reply);
            }

            case "deepseek": {
                const strictPrompt = `[System Instruction: You are DeepSeek AI built by DeepSeek corporation.] Question: ${prompt}`;
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-deepseek?uid=12345&text=${encodeURIComponent(strictPrompt)}`, { timeout: 25000 });
                return sendStandardizedResponse(res, "DeepSeek", response.data.reply);
            }

            case "claude-opus-4.7":
            case "claude-opus": {
                const response = await axios.get(`https://klyphic.onrender.com/chat?token=033b3b43aa3d4c93bb0952161c0df3a7&q=${encodeURIComponent(prompt)}&model=claude-opus-4.7`, { timeout: 30000 });
                return sendStandardizedResponse(res, "Claude Opus 4.7", response.data.response);
            }

            case "llama3.2": {
                const response = await axios.post("http://108.181.196.208:11434/api/chat", {
                    model: "llama3.2:latest", messages: [{ role: "user", content: prompt }], stream: false
                }, { timeout: 30000 });
                return sendStandardizedResponse(res, "Llama 3.2 Latest", response.data.message.content);
            }

            case "llava": {
                const response = await axios.post("http://108.181.196.208:11434/api/chat", {
                    model: "llava:latest", messages: [{ role: "user", content: prompt }], stream: false
                }, { timeout: 35000 });
                return sendStandardizedResponse(res, "Llava Vision AI", response.data.message.content);
            }

            case "smollm2": {
                const response = await axios.post("http://108.181.196.208:11434/api/chat", {
                    model: "smollm2:135m", messages: [{ role: "user", content: prompt }], stream: false
                }, { timeout: 25000 });
                return sendStandardizedResponse(res, "SmolLM2 135m", response.data.message.content);
            }

            case "wormgpt": {
                const response = await axios.get(`https://wormgpt.freeapihub.workers.dev/chat?q=${encodeURIComponent(prompt)}`, { timeout: 25000 });
                return sendStandardizedResponse(res, "WormGPT Enterprise", response.data.reply || response.data.response);
            }

            // --- VIDEO GENERATION MODELS (Timeout set to 3 Minutes) ---
            case "sora-video-six":
            case "text-to-video-six": {
                const response = await axios.get(`https://texttovideo-six.vercel.app/generate?prompt=${encodeURIComponent(prompt)}`, { timeout: 180000 });
                return sendStandardizedResponse(res, "Sora Vercel Multi-node Six", response.data.url);
            }

            case "sora2-video": {
                const response = await axios.post("https://zecora0.serv00.net/ai/Sora2_s4.php", {
                    prompt: prompt, aspect: "16:9"
                }, { headers: { "Content-Type": "application/json" }, timeout: 180000 });
                return sendStandardizedResponse(res, "Sora2 AI Video Engine", response.data.UrlVideo);
            }

            // --- IMAGE GENERATION MODELS (Timeout Extended to 1 Minute 30 Seconds / 90000ms) ---
            case "veo-image": {
                const pageData = await axios.get("https://veoaifree.com/veo-video-generator/", { timeout: 25000 });
                let nonce = null;
                const match = pageData.data.match(/"nonce"\s*:\s*"([a-zA-Z0-9]+)"/);
                if (match) nonce = match[1];
                if (!nonce) throw new Error("Veo Scraping Nonce engine mismatched.");
                
                const payload = new URLSearchParams();
                payload.append("action", "veo_video_generator");
                payload.append("nonce", nonce);
                payload.append("promptText", prompt);
                payload.append("totalImages", "1");
                payload.append("ratio", "IMAGE_ASPECT_RATIO_PORTRAIT");
                payload.append("actionType", "whisk_final_image");
                payload.append("model", "veo");

                const imgResponse = await axios.post("https://veoaifree.com/wp-admin/admin-ajax.php", payload, { timeout: 90000 });
                let base64Uri = imgResponse.data.data?.data_uri || imgResponse.data.data_uri || "";
                if (base64Uri.includes("base64,")) base64Uri = base64Uri.split("base64,")[1];

                const secureLink = await uploadToTmpStorage(base64Uri, "base64");
                return sendStandardizedResponse(res, "Veo Image Generator Engine", secureLink);
            }

            case "dalle": {
                const response = await axios.post("https://yabes-api.pages.dev/api/ai/image/dalle", { prompt: prompt }, { timeout: 90000 });
                return sendStandardizedResponse(res, "Dall-E AI Node", response.data.output);
            }

            case "nanobanana-pro":
            case "nanobanana": {
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-nanobanana-pro?text=${encodeURIComponent(prompt)}`, { timeout: 90000 });
                return sendStandardizedResponse(res, "KILWA Nanobanana Pro", response.data.image_url);
            }

            case "gpt-image-2":
            case "gpt-image": {
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-gpt-img?text=${encodeURIComponent(prompt)}`, { timeout: 90000 });
                return sendStandardizedResponse(res, "GPT Image 2 Node System", response.data.image_url);
            }

            case "nanobanana-2":
            case "nano-banana2": {
                const response = await axios.get(`http://de3.bot-hosting.net:21007/kilwa-img?text=${encodeURIComponent(prompt)}`, { timeout: 90000 });
                return sendStandardizedResponse(res, "Nano Banana Engine Gen 2", response.data.image_url);
            }

            case "flip-gen":
            case "flip-realistic":
            case "flip-anime":
            case "flip-fantasy":
            case "flip-cyberpunk":
            case "flip-watercolor":
            case "flip-oil-painting":
            case "flip-pixel-art":
            case "flip-sketch":
            case "flip-cartoon":
            case "flip-abstract":
            case "flip-vintage":
            case "flip-steampunk": {
                let styleSlug = modelKey.replace("flip-", "");
                if (styleSlug === "flip-gen") styleSlug = fallbackStyle;
                
                const response = await axios.get(`https://flip-gen.vercel.app/ai/image/${styleSlug}?prompt=${encodeURIComponent(prompt)}`, { timeout: 90000 });
                return sendStandardizedResponse(res, `Flip-Gen Style: [${styleSlug}]`, response.data.image_url);
            }

            case "flux-cyberpunk": {
                const response = await axios.post("https://image.itz-ashlynn.workers.dev/generate", {
                    prompt: prompt, version: "flux", style: "futuristic_retro_cyberpunk"
                }, { responseType: 'arraybuffer', timeout: 90000 });
                const secureLink = await uploadToTmpStorage(response.data, "buffer");
                return sendStandardizedResponse(res, "Flux Cyberpunk Neural Engine", secureLink);
            }

            case "sdxl-watercolor": {
                const response = await axios.post("https://image.itz-ashlynn.workers.dev/generate", {
                    prompt: prompt, version: "sdxl", style: "watercolor"
                }, { responseType: 'arraybuffer', timeout: 90000 });
                const secureLink = await uploadToTmpStorage(response.data, "buffer");
                return sendStandardizedResponse(res, "SDXL High Fidelity Watercolor Studio", secureLink);
            }

            // Fallback for custom dynamic style presets (SDXL Backend Nodes)
            default: {
                if (MODELS_REGISTRY[modelKey] && MODELS_REGISTRY[modelKey].style_key) {
                    const mappedStyleKey = MODELS_REGISTRY[modelKey].style_key;
                    const response = await axios.post("https://image.itz-ashlynn.workers.dev/generate", {
                        prompt: prompt, version: "sdxl", style: mappedStyleKey
                    }, { responseType: 'arraybuffer', timeout: 90000 });
                    const secureLink = await uploadToTmpStorage(response.data, "buffer");
                    return sendStandardizedResponse(res, `SDXL [Style Preset: ${mappedStyleKey}]`, secureLink);
                }
                
                return res.status(404).json({ status: "failed", error: `Model key '${chosenModel}' layout configuration arrays matching error. Check /api/models`, ...BRANDING });
            }
        }

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            error: "Target backend host took too long to respond (Timeout) or server is temporarily overloaded.",
            technical_details: error.message,
            ...BRANDING
        });
    }
});

// Catch-All
app.use((req, res) => {
    res.status(404).json({ status: "failed", error: "Valid routes mapping: /api/models, /api/chat", ...BRANDING });
});

module.exports = app;
