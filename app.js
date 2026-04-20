function initializeDashboardApp() {
    const generateBtn = document.getElementById('generateBtn');
    const generateFromProfileBtn = document.getElementById('generateFromProfileBtn');

    if (generateBtn) {
        generateBtn.addEventListener('click', generateMessages);
    }

    if (generateFromProfileBtn) {
        generateFromProfileBtn.addEventListener('click', generateMessagesFromFullProfile);
    }

    setMessageType('linkedin');
}

const MISTRAL_API_KEY = 'mdfEEYtoO7W9Q1D7Xu5lvZU9dVJZJjjy';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
let messageType = 'linkedin';
let linkedinSubType = 'first_message';
let lastGenerationContext = null; // Store context for regeneration

// ICP Criteria
const ICP_CRITERIA = {
    targetTitles: ['CEO', 'Founder', 'President', 'VP', 'Director', 'Head of', 'Chief'],
    targetLocations: ['United States', 'Canada', 'United Kingdom', 'US', 'UK', 'CA'],
    excludeIndustries: ['Staffing', 'Recruiting', 'HR Consulting', 'Recruitment'],
    companySizeRange: ['11-50', '51-200', '201-500', '501-1000']
};

const LEVOX_COMPANY_CONTEXT = `LEVOX INFOTECH - COMPREHENSIVE COMPANY OVERVIEW
WHO WE ARE: A full-service digital innovation partner and branding & digital agency based in Ahmedabad, India. We combine innovation with strategy to transform ideas into impactful visual stories.
CORE PHILOSOPHY: "We don't chase low-cost shortcuts; we believe in high-quality results that speak for themselves."

OUR COMPETITIVE ADVANTAGES (ESPECIALLY FOR FOREIGN CLIENTS):
1. Premium Quality at India Advantage Pricing: We offer the same world-class quality as top agencies in New York, London, or Sydney, but at 40-70% lower cost. 
2. Proven Track Record: 100+ successful projects globally across diverse industries (Tiles, Energy, Food, Real Estate, E-Commerce, etc.).
3. Time Zone Advantage: "While you sleep, we work. By the time you start your day, you have updates and progress waiting."
4. Communication & Trust: English-speaking professional team, transparent milestone-based payments, modern tech stack, and a satisfaction guarantee.
5. End-to-End Solutions: Single-vendor convenience (tech, design, growth, AI integration) so clients don't juggle multiple agencies. Custom original solutions (no templates).

OUR SERVICES:
- Brand Identity & Packaging: Luxury packaging, emotional storytelling, brand positioning.
- Website Design & Development: Mobile-first, fast, secure, scalable, e-commerce, custom UI/UX.
- Digital Marketing & SEO: Performance-driven, data-backed strategies, higher search rankings.
- Social Media & Content: Video production, compelling copywriting, community management.
- AI Integration & Automation: Smart efficiency solutions and future-ready technology.

OUR USP FOR FOREIGN MARKETS:
"Global Quality. India Advantage. Your Success." 
"Premium Branding & Digital Solutions at 40-70% Lower Investment Than Your Local Agency."`;

// Service details
const SERVICES = {
    website: {
        label: 'Website Design & Development',
        offer: 'mobile-first agile development, user-centric UI/UX, and conversion-focused corporate/e-commerce platforms',
        benefit: 'attract audiences, build scalable digital platforms, and drive efficient business growth'
    },
    branding: {
        label: 'Brand Identity & Packaging',
        offer: 'brand positioning, logo identity systems, emotional storytelling, and luxury packaging',
        benefit: 'build brands with purpose, capture attention, and stand strong in a competitive market'
    },
    seo: {
        label: 'Digital Marketing & SEO',
        offer: 'data-backed SEO, targeted advertising campaigns, and performance tracking',
        benefit: 'boost visibility and turn clicks into loyal customers with performance-driven marketing'
    },
    social: {
        label: 'Social Media & Content',
        offer: 'compelling copywriting, video production, and engaging platform-specific community management',
        benefit: 'inform and entertain to build genuine connections and consistent brand presence'
    },
    ecommerce: {
        label: 'E-commerce Handling',
        offer: 'online store management, product display optimization, and customer experience enhancement',
        benefit: 'optimize every step of the customer journey from product display to checkout'
    },
    automation: {
        label: 'AI Integration & Support',
        offer: 'AI-driven tool implementation and business process automation',
        benefit: 'make businesses smarter, future-ready, and highly efficient'
    },
    general: {
        label: 'Full-Service Digital Solution',
        offer: 'an end-to-end unified brand vision and single-vendor convenience spanning tech, design, and growth',
        benefit: 'eliminate multi-agency juggling while delivering premium results at significant cost savings'
    }
};

const MESSAGE_TYPE_META = {
    linkedin: { label: 'LinkedIn Message', icon: '&#128188;' },
    email: { label: 'Email', icon: '&#128231;' },
    whatsapp: { label: 'WhatsApp Message', icon: '&#128172;' },
    coldcall: { label: 'Cold Call Script', icon: '📞' }
};

// === LEVOX OUTREACH REQUIREMENTS ===
const LEVOX_OUTREACH_REQUIREMENTS = `
REQUIREMENTS:
Generate one short, attractive, high-response-rate outreach message based on client profile, company details, and company data. Focus on the client’s needs, pain points, goals, and how we can help solve them. Highlight our key strengths, value, and benefits naturally. Keep it personalized, professional, engaging, and reply-focused with a clear call-to-action. Follow custom instructions as highest priority and avoid anything the user says not to use.
Provide EXACTLY 1 MESSAGE.
Always end messages exactly with this sign-off (do NOT add extra slogans):
Best,
Ajrudin
Levox Infotech`;

const LEVOX_FOLLOWUP_FORMAT = `
MANDATORY FORMAT STRUCTURE:
[Friendly Greeting],

[1 Sentence: Soft reference to something nice about their profile or company]

[1 Sentence: Point out the specific weakness/gap you noticed]

[1 Sentence: How Levox solves this using the 1-2 recommended services]

Best,
Ajrudin
Levox Infotech
`;

function setMessageType(type) {
    messageType = MESSAGE_TYPE_META[type] ? type : 'linkedin';
    document.querySelectorAll('.message-type-btn').forEach(button => {
        button.classList.toggle('active', button.dataset.messageType === messageType);
    });

    // Show/hide LinkedIn sub-type selectors based on channel
    const subTypeManual = document.getElementById('linkedinSubTypeManual');
    const subTypeProfile = document.getElementById('linkedinSubTypeProfile');

    if (messageType === 'linkedin') {
        if (subTypeManual) { subTypeManual.classList.remove('hidden'); subTypeManual.classList.add('active'); }
        if (subTypeProfile) { subTypeProfile.classList.remove('hidden'); subTypeProfile.classList.add('active'); }
    } else {
        if (subTypeManual) { subTypeManual.classList.add('hidden'); subTypeManual.classList.remove('active'); }
        if (subTypeProfile) { subTypeProfile.classList.add('hidden'); subTypeProfile.classList.remove('active'); }
    }
}

function setLinkedinSubType(subType, formMode) {
    linkedinSubType = subType;

    // Update active state on buttons within the relevant form
    const containerId = formMode === 'profile' ? 'linkedinSubTypeProfile' : 'linkedinSubTypeManual';
    const container = document.getElementById(containerId);
    if (container) {
        container.querySelectorAll('.linkedin-subtype-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.subtype === subType);
        });
    }

    // Show/hide previousConversation textarea
    const prevConvoId = formMode === 'profile' ? 'prevConvoWrapperProfile' : 'prevConvoWrapperManual';
    const prevConvoWrapper = document.getElementById(prevConvoId);
    if (prevConvoWrapper) {
        if (subType === 'followup_reply') {
            prevConvoWrapper.classList.remove('hidden');
            prevConvoWrapper.classList.add('active');
        } else {
            prevConvoWrapper.classList.add('hidden');
            prevConvoWrapper.classList.remove('active');
        }
    }
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    element.classList.remove('hidden');
    element.classList.add('active');
}

function hideElement(elementId) {
    const element = document.getElementById(elementId);
    element.classList.add('hidden');
    element.classList.remove('active');
}

function getCustomStrategy(mode) {
    if (mode === 'manual') {
        return (document.getElementById('customStrategyManual')?.value || '').trim();
    }
    return (document.getElementById('customStrategyProfile')?.value || '').trim();
}

async function generateMessages() {
    // Get form data
    const prospectData = {
        name: document.getElementById('prospectName').value.trim(),
        title: document.getElementById('prospectTitle').value.trim(),
        company: document.getElementById('prospectCompany').value.trim(),
        industry: document.getElementById('prospectIndustry').value.trim(),
        location: document.getElementById('prospectLocation').value.trim(),
        companySize: document.getElementById('companySize').value,
        recentActivity: document.getElementById('recentActivity').value.trim(),
        painPoints: document.getElementById('painPoints').value.trim(),
        websiteStatus: document.getElementById('websiteStatus').value,
        socialActivity: document.getElementById('socialActivity').value,
        serviceFocus: document.getElementById('serviceFocus').value,
        customStrategy: getCustomStrategy('manual'),
        messageType,
        linkedinSubType: messageType === 'linkedin' ? linkedinSubType : null,
        previousConversation: (document.getElementById('previousConversationManual')?.value || '').trim()
    };

    // Validate required fields
    if (!prospectData.name || !prospectData.title || !prospectData.company) {
        showError('Please fill in Name, Title, and Company fields');
        return;
    }

    // Validate previousConversation for follow-up reply
    if (prospectData.linkedinSubType === 'followup_reply' && !prospectData.previousConversation) {
        showError('Please paste the previous conversation for a follow-up message');
        return;
    }

    // Store context for regeneration
    lastGenerationContext = { type: 'manual', data: prospectData };

    // Show loading
    showElement('loadingBox');
    hideElement('errorBox');
    document.getElementById('outputContainer').innerHTML = '';

    try {
        // Run ICP Analysis
        const icpResult = analyzeICP(prospectData);

        // Generate messages using the current outreach prompt strategy
        const messages = await generateWithMistral(prospectData, icpResult);

        // Display results
        renderResults(prospectData, icpResult, messages);

    } catch (error) {
        showError(error.message);
    } finally {
        hideElement('loadingBox');
    }
}

async function generateMessagesFromFullProfile() {
    const profileText = document.getElementById('fullLinkedinProfile').value.trim();
    const customStrategy = getCustomStrategy('profile');
    const currentLinkedinSubType = messageType === 'linkedin' ? linkedinSubType : null;
    const previousConversation = (document.getElementById('previousConversationProfile')?.value || '').trim();

    if (!profileText) {
        showError('Please paste the full LinkedIn profile text before generating');
        return;
    }

    // Validate previousConversation for follow-up reply
    if (currentLinkedinSubType === 'followup_reply' && !previousConversation) {
        showError('Please paste the previous conversation for a follow-up message');
        return;
    }

    // Store context for regeneration
    lastGenerationContext = { type: 'fullProfile', data: { profileText, customStrategy, messageType, linkedinSubType: currentLinkedinSubType, previousConversation } };

    showElement('loadingBox');
    hideElement('errorBox');
    document.getElementById('outputContainer').innerHTML = '';

    try {
        const messages = await generateFromRawLinkedInProfile(profileText, messageType, customStrategy, currentLinkedinSubType, previousConversation);
        renderRawProfileResults(profileText, messages, messageType, currentLinkedinSubType);
    } catch (error) {
        showError(error.message);
    } finally {
        hideElement('loadingBox');
    }
}

async function handleRegenerate() {
    if (!lastGenerationContext) return;

    const regenBtn = document.getElementById('regenerateBtn');
    if (regenBtn) {
        regenBtn.disabled = true;
        regenBtn.classList.add('spinning');
        regenBtn.innerHTML = '<span class="spin-icon">🔄</span> Regenerating...';
    }

    showElement('loadingBox');
    hideElement('errorBox');
    document.getElementById('outputContainer').innerHTML = '';

    try {
        if (lastGenerationContext.type === 'manual') {
            const prospectData = lastGenerationContext.data;
            const icpResult = analyzeICP(prospectData);
            const messages = await generateWithMistral(prospectData, icpResult);
            renderResults(prospectData, icpResult, messages);
        } else if (lastGenerationContext.type === 'fullProfile') {
            const { profileText, customStrategy, messageType: mt, linkedinSubType: lst, previousConversation: pc } = lastGenerationContext.data;
            const messages = await generateFromRawLinkedInProfile(profileText, mt, customStrategy, lst, pc);
            renderRawProfileResults(profileText, messages, mt, lst);
        }
    } catch (error) {
        showError(error.message);
    } finally {
        hideElement('loadingBox');
        if (regenBtn) {
            regenBtn.disabled = false;
            regenBtn.classList.remove('spinning');
            regenBtn.innerHTML = '<span class="spin-icon">🔄</span> Regenerate';
        }
    }
}

function analyzeICP(prospect) {
    const checks = [];
    let score = 0;
    let maxScore = 0;

    // Check title
    maxScore++;
    const hasTargetTitle = ICP_CRITERIA.targetTitles.some(title =>
        prospect.title.toLowerCase().includes(title.toLowerCase())
    );
    checks.push({
        criteria: 'Job Title Match',
        pass: hasTargetTitle,
        detail: hasTargetTitle ? `✓ ${prospect.title} is a decision-maker role` : `✗ Title doesn't match target roles`
    });
    if (hasTargetTitle) score++;

    // Check location
    if (prospect.location) {
        maxScore++;
        const hasTargetLocation = ICP_CRITERIA.targetLocations.some(loc =>
            prospect.location.toLowerCase().includes(loc.toLowerCase())
        );
        checks.push({
            criteria: 'Location Match',
            pass: hasTargetLocation,
            detail: hasTargetLocation ? `✓ Located in target region` : `✗ Location outside target regions`
        });
        if (hasTargetLocation) score++;
    }

    // Check industry exclusions
    if (prospect.industry) {
        maxScore++;
        const isExcludedIndustry = ICP_CRITERIA.excludeIndustries.some(ind =>
            prospect.industry.toLowerCase().includes(ind.toLowerCase())
        );
        checks.push({
            criteria: 'Industry Check',
            pass: !isExcludedIndustry,
            detail: !isExcludedIndustry ? `✓ Industry is suitable` : `✗ Excluded industry (Staffing/Recruiting)`
        });
        if (!isExcludedIndustry) score++;
    }

    // Check company size
    if (prospect.companySize) {
        maxScore++;
        const isTargetSize = ICP_CRITERIA.companySizeRange.includes(prospect.companySize);
        checks.push({
            criteria: 'Company Size',
            pass: isTargetSize,
            detail: isTargetSize ? `✓ Company size in target range` : `⚠ Company size outside ideal range`
        });
        if (isTargetSize) score++;
    }

    const icpScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const isMatch = icpScore >= 60;

    return {
        isMatch,
        score: icpScore,
        checks,
        recommendation: isMatch ? 'Proceed with outreach' : 'Review manually before contacting'
    };
}

function buildCustomStrategyBlock(customStrategy) {
    if (!customStrategy) return '';
    return `
*** CRITICAL OVERRIDE: CUSTOM USER STRATEGY ***
The user has provided a custom strategy. YOU MUST MAKE THIS YOUR ABSOLUTE HIGHEST PRIORITY.
Write the message specifically based on the angle, tone, or context in this custom strategy FIRST.
Use standard templates or company strengths ONLY to intelligently enhance the user's strategy when needed.
Ensure the final output feels natural, personalized, high-converting, and perfectly aligned with the user's exact strategy.
Focus on conversions, trust, curiosity, and clear call-to-action.

USER STRATEGY: "${customStrategy}"
***********************************************`;
}

async function generateWithMistral(prospect, icpResult) {
    const service = SERVICES[prospect.serviceFocus];
    const customStrategy = prospect.customStrategy || '';

    // Build context for AI
    const contextParts = [];
    if (prospect.recentActivity) contextParts.push(`Recent activity: ${prospect.recentActivity}`);
    if (prospect.painPoints) contextParts.push(`Pain points: ${prospect.painPoints}`);
    if (prospect.industry) contextParts.push(`Industry: ${prospect.industry}`);
    if (prospect.websiteStatus && prospect.websiteStatus !== 'unknown') contextParts.push(`Website status: ${prospect.websiteStatus}`);
    if (prospect.socialActivity && prospect.socialActivity !== 'unknown') contextParts.push(`Social activity: ${prospect.socialActivity}`);

    const context = contextParts.join('. ');
    const strategyBlock = buildCustomStrategyBlock(customStrategy);

    if (prospect.messageType === 'email' || prospect.messageType === 'whatsapp' || prospect.messageType === 'coldcall') {
        const prompt = buildStructuredProspectPrompt(prospect, context, service, customStrategy);
        const rawResponse = await callMistralAPI(prompt, prospect.messageType === 'coldcall' ? 1200 : 600);
        return parseStructuredChannelResponse(rawResponse, prospect.messageType);
    }

    const subType = prospect.linkedinSubType || 'first_message';

    // --- CONNECTION NOTE ONLY ---
    if (subType === 'connection_only') {
        const connectionOnlyPrompt = `You are a HIGH-CONVERTING B2B sales expert writing outreach for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Prospect: ${prospect.name}, ${prospect.title} at ${prospect.company}
${context ? `Context: ${context}` : ''}

Message Type: Connection Note

Write a LinkedIn CONNECTION NOTE. Always provide EXACTLY 1 MESSAGE.

STRICT RULES:
- Maximum 200 characters including spaces
- 1-2 lines ONLY
- NO selling, NO pitch, NO services mention
- Friendly + curiosity only
- Show genuine interest in their work
- Reference something specific about their role, company, or market
- Do NOT use generic lines like "I came across your profile"
- Do NOT use AI tone or over-explain
- Make it feel human + sharp
- Be warm and approachable
- NO big paragraph

${strategyBlock}

Output FORMAT:
[Message text]`;

        const connectionMsg = await callMistralAPI(connectionOnlyPrompt, 300);
        return { _subType: 'connection_only', connection: connectionMsg.trim() };
    }

    // --- FOLLOW-UP REPLY ---
    if (subType === 'followup_reply') {
        const previousConversation = prospect.previousConversation || '';
        const followupReplyPrompt = `You are a HIGH-CONVERTING B2B sales expert writing outreach for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Prospect:
- Name: ${prospect.name}
- Title: ${prospect.title}
- Company: ${prospect.company}
${prospect.industry ? `- Industry: ${prospect.industry}` : ''}
${prospect.location ? `- Location: ${prospect.location}` : ''}
${context ? `- Extra Context: ${context}` : ''}

Message Type: Follow-up Message

Previous Conversation:
${previousConversation}

Instructions:
- Read and understand the previous conversation carefully
- Continue the conversation naturally from where it left off
- Adapt tone based on how the conversation has been going
- Add value — share an insight, resource, or relevant observation
- Include a soft CTA (suggest a call, share something useful, or ask a relevant question)
- Do NOT repeat anything from the first message
- Do NOT re-introduce yourself or Levox from scratch
- Be human, not AI
- Keep it short and relevant
- Use SPACING — no big paragraphs
- Provide EXACTLY 1 MESSAGE.

${strategyBlock}

Output FORMAT:
[Message text]`;

        const followupReplyMsg = await callMistralAPI(followupReplyPrompt, 600);
        return { _subType: 'followup_reply', followup: followupReplyMsg.trim() };
    }

    // --- FIRST MESSAGE (existing flow) ---
    const followupPrompt = `You are a HIGH-CONVERTING B2B sales expert writing outreach for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Prospect:
- Name: ${prospect.name}
- Title: ${prospect.title}
- Company: ${prospect.company}
${prospect.industry ? `- Industry: ${prospect.industry}` : ''}
${prospect.location ? `- Location: ${prospect.location}` : ''}
${prospect.websiteStatus ? `- Website: ${prospect.websiteStatus}` : ''}
${prospect.socialActivity ? `- Social Activity: ${prospect.socialActivity}` : ''}
${context ? `- Extra Context: ${context}` : ''}

Primary Levox angle:
- ${service.label}
- ${service.offer}
- Business impact: ${service.benefit}

THINK LIKE A STRATEGIST before writing:
1. What are they doing?
2. Where are they weak?
3. What are they missing?
4. Detect PAIN POINTS: weak website conversion, no clear branding, low visibility, poor UI/UX, no lead system, inconsistent marketing
5. Match ONLY 1-2 strong improvements to their problem

${strategyBlock}

${LEVOX_FOLLOWUP_FORMAT}

⚠️ STRICT RULES:
- NO big paragraph — use spacing between each section
- NO AI tone, NO generic lines
- NO over-explaining
- Make it human + sharp
- Suggest ONLY 1-2 relevant improvements connected to their problem
- The Levox positioning block MUST be included exactly as shown
- End with: Open to a quick chat?

Output ONLY the final message text. No explanations, no headings, no extra text.`;

    const followupMsg = await callMistralAPI(followupPrompt);

    return {
        _subType: 'first_message',
        connection: '',
        followup: followupMsg.trim()
    };
}

async function generateFromRawLinkedInProfile(profileText, selectedMessageType, customStrategy, subType, previousConversation) {
    if (selectedMessageType === 'email' || selectedMessageType === 'whatsapp' || selectedMessageType === 'coldcall') {
        const rawResponse = await callMistralAPI(buildRawProfilePrompt(profileText, 0, selectedMessageType, customStrategy), selectedMessageType === 'coldcall' ? 1200 : 600);
        return parseStructuredChannelResponse(rawResponse, selectedMessageType);
    }

    const effectiveSubType = subType || 'first_message';

    // --- CONNECTION NOTE ONLY (from profile) ---
    if (effectiveSubType === 'connection_only') {
        const prompt = buildRawProfileConnectionOnlyPrompt(profileText, customStrategy);
        const rawResponse = await callMistralAPI(prompt, 300);
        const cleaned = cleanGeneratedMessageText(rawResponse, { preserveLineBreaks: true });
        return { _subType: 'connection_only', connection: trimConnectionMessage(cleaned) };
    }

    // --- FOLLOW-UP REPLY (from profile) ---
    if (effectiveSubType === 'followup_reply') {
        const prompt = buildRawProfileFollowupReplyPrompt(profileText, customStrategy, previousConversation || '');
        const rawResponse = await callMistralAPI(prompt, 600);
        const cleaned = cleanGeneratedMessageText(rawResponse, { preserveLineBreaks: true });
        return { _subType: 'followup_reply', followup: cleaned };
    }

    // --- FIRST MESSAGE (existing flow) ---
    const rawResponse = await callMistralAPI(buildRawProfilePrompt(profileText, 0, selectedMessageType, customStrategy), 600);
    const cleaned = cleanGeneratedMessageText(rawResponse, { preserveLineBreaks: true });

    return {
        _subType: 'first_message',
        connection: '',
        followup: cleaned
    };
}

function buildRawProfileConnectionOnlyPrompt(profileText, customStrategy) {
    const strategyBlock = buildCustomStrategyBlock(customStrategy);
    return `You are a HIGH-CONVERTING B2B sales expert writing outreach for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Analyze the following LinkedIn profile and generate a CONNECTION NOTE.

Message Type: Connection Note

PROFILE DATA:
${profileText}

STRICT RULES:
- Maximum 200 characters including spaces
- 1-2 lines ONLY
- NO selling, NO pitch, NO services mention
- Friendly + curiosity only
- Show genuine interest in their work
- Reference something specific from their profile
- Do NOT use generic lines like "I came across your profile"
- Do NOT use AI tone or over-explain
- Make it feel human + sharp
- Be warm and approachable
- NO big paragraph
- Provide EXACTLY 1 MESSAGE.

${strategyBlock}

Output FORMAT:
[Message text]`;
}

function buildRawProfileFollowupReplyPrompt(profileText, customStrategy, previousConversation) {
    const strategyBlock = buildCustomStrategyBlock(customStrategy);
    return `You are a HIGH-CONVERTING B2B sales expert writing outreach for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Analyze the following LinkedIn profile and generate a FOLLOW-UP message that continues an existing conversation.

Message Type: Follow-up Message

PROFILE DATA:
${profileText}

Previous Conversation:
${previousConversation}

Instructions:
- Read and understand the previous conversation carefully
- Continue the conversation naturally from where it left off
- Adapt tone based on how the conversation has been going
- Add value — share an insight, resource, or relevant observation
- Include a soft CTA (suggest a call, share something useful, or ask a relevant question)
- Do NOT repeat anything from the first message
- Do NOT re-introduce yourself or Levox from scratch
- Be human, not AI
- Keep it short and relevant
- Use SPACING — no big paragraphs
- Provide EXACTLY 1 MESSAGE.

${strategyBlock}

Output FORMAT:
[Message text]`;
}

function buildStructuredProspectPrompt(prospect, context, service, customStrategy) {
    const strategyBlock = buildCustomStrategyBlock(customStrategy);

    const channelInstructions = prospect.messageType === 'email'
        ? `Return exactly in this format:
Subject Line:
[subject 1]

Email Body:
[email body]

Email requirements:
- Subject Line: short, catchy, specific
- Email body: 2-3 sentences max (strictly under 60 words)
- Professional but friendly tone
- Personalized intro
- Show business understanding
- Mention only 1-2 relevant improvements
- Position Levox naturally as a premium branding/digital partner
- Include the Levox positioning block naturally
- Highlight premium quality with a 40-70% cost advantage versus typical US/UK/AU agency pricing
- Soft CTA
- Provide EXACTLY 1 MESSAGE.`
        : prospect.messageType === 'coldcall'
            ? `Return exactly in this format:

OPENING LINE:
[A natural, non-awkward opening line. Introduce yourself from Levox Infotech. Keep it warm and confident.]

INTEREST HOOK:
[1-2 sentences to build interest in the first 10 seconds. Reference something specific about their business.]

DISCOVERY QUESTIONS:
[3-4 questions to understand their needs. Each on its own line, numbered.]

PITCH:
[Short and strong pitch, 3-5 sentences max. Cover what Levox does and how it helps THEM specifically.]

OBJECTION - NOT INTERESTED:
[Natural comeback, 2-3 sentences]

OBJECTION - NO BUDGET:
[Natural comeback, 2-3 sentences. Can mention cost advantage.]

OBJECTION - ALREADY HAVE A TEAM:
[Natural comeback, 2-3 sentences. Focus on augmentation/fresh perspective.]

CLOSING LINE:
[1-2 sentences to book a meeting. Soft but clear.]

Cold call script requirements:
- Conversational and natural — NOT robotic
- Confident but not pushy
- Each section should flow into the next
- Personalized to their role/company/industry
- Keep it practical — something a real person would say on a call
- Suggest only 1-2 relevant services
- Position Levox as premium with cost advantage`
            : `Return exactly in this format:
WhatsApp Message:
[message text]

WhatsApp requirements:
- Very casual, human tone
- 2-3 lines max (strictly under 60 words)
- Personalized
- Quick insight + CTA
- No formal structure
- Provide EXACTLY 1 MESSAGE.`;

    return `You are a HIGH-CONVERTING B2B sales expert writing outreach for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Message Type: ${prospect.messageType}

Prospect:
- Name: ${prospect.name}
- Title: ${prospect.title}
- Company: ${prospect.company}
${prospect.industry ? `- Industry: ${prospect.industry}` : ''}
${prospect.location ? `- Location: ${prospect.location}` : ''}
${prospect.companySize ? `- Company Size: ${prospect.companySize}` : ''}
${prospect.websiteStatus ? `- Website: ${prospect.websiteStatus}` : ''}
${prospect.socialActivity ? `- Social Activity: ${prospect.socialActivity}` : ''}
${context ? `- Context: ${context}` : ''}

Levox angle:
- Primary focus: ${service.label}
- Relevant support: ${service.offer}
- Business impact: ${service.benefit}

THINK LIKE A STRATEGIST:
1. What are they doing? Where are they weak? What are they missing?
2. Detect pain points and match ONLY 1-2 strong improvements
3. Connect directly to their problem

${strategyBlock}

Requirements:
- Write like a real human — NO AI tone
- Use SPACING between sections — NO big paragraphs
- No generic lines, no over-explaining
- Make it human + sharp
- No extra commentary or explanation

${channelInstructions}`;
}

function buildRawProfilePrompt(profileText, attempt, selectedMessageType = 'linkedin', customStrategy = '') {
    const strategyBlock = buildCustomStrategyBlock(customStrategy);

    if (selectedMessageType === 'email') {
        return `You are a HIGH-CONVERTING B2B sales expert writing outreach for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Analyze the following LinkedIn profile and generate personalized outreach.

Message Type: ${selectedMessageType}

PROFILE DATA:
${profileText}

THINK LIKE A STRATEGIST:
1. What are they doing? Where are they weak? What are they missing?
2. Detect pain points and match ONLY 1-2 strong improvements
3. Connect directly to their problem

${strategyBlock}

Return exactly in this format:
Subject Line:
[subject 1]

Email Body:
[email body 1]

Requirements:
- Subject line is short and catchy
- Email body is 2-3 sentences max (strictly under 60 words)
- Use SPACING between sections — NO big paragraphs
- Professional but friendly tone — NO AI tone
- Personalized intro
- Show business understanding
- Mention only 1-2 relevant improvements
- Position Levox naturally
- Include Levox positioning (15+ years, 360° services, faster results, 40-70% cost advantage)
- Soft CTA
- Provide EXACTLY 1 MESSAGE.
- Output only the requested sections`;
    }

    if (selectedMessageType === 'whatsapp') {
        return `You are a HIGH-CONVERTING B2B sales expert writing outreach for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Analyze the following LinkedIn profile and generate personalized outreach.

Message Type: ${selectedMessageType}

PROFILE DATA:
${profileText}

${strategyBlock}

Return exactly in this format:
WhatsApp Message:
[message text]

Requirements:
- Very casual, human tone — NO AI tone
- 2-3 lines max (strictly under 60 words)
- Personalized
- Quick insight + CTA
- No formal structure
- Provide EXACTLY 1 MESSAGE.
- Output only the requested sections`;
    }

    if (selectedMessageType === 'coldcall') {
        return `You are a HIGH-CONVERTING B2B sales expert writing a COLD CALL SCRIPT for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Analyze the following LinkedIn profile and generate a personalized cold call script.

PROFILE DATA:
${profileText}

THINK LIKE A STRATEGIST:
1. What are they doing? Where are they weak? What are they missing?
2. Detect pain points and match ONLY 1-2 strong improvements
3. Connect directly to their problem

${strategyBlock}

Return exactly in this format:

OPENING LINE:
[A natural, non-awkward opening line. Introduce yourself from Levox Infotech. Keep it warm and confident.]

INTEREST HOOK:
[1-2 sentences to build interest in the first 10 seconds. Reference something specific about their business.]

DISCOVERY QUESTIONS:
[3-4 questions to understand their needs. Each on its own line, numbered.]

PITCH:
[Short and strong pitch, 3-5 sentences max. Cover what Levox does and how it helps THEM specifically.]

OBJECTION - NOT INTERESTED:
[Natural comeback, 2-3 sentences]

OBJECTION - NO BUDGET:
[Natural comeback, 2-3 sentences. Can mention cost advantage.]

OBJECTION - ALREADY HAVE A TEAM:
[Natural comeback, 2-3 sentences. Focus on augmentation/fresh perspective.]

CLOSING LINE:
[1-2 sentences to book a meeting. Soft but clear.]

Requirements:
- Conversational and natural — NOT robotic or scripted-sounding
- Confident but not pushy
- Personalized to their role and company
- Keep it practical — something a real person would say
- Suggest only 1-2 relevant services
- Position Levox as premium
- Output only the requested sections`;
    }

    const retryInstruction = attempt > 0
        ? `
RETRY RULE:
- Your last connection message was invalid because it exceeded 300 characters or included unwanted text
- Make the connection message shorter and cleaner this time
`
        : '';

    return `You are a HIGH-CONVERTING B2B SALES EXPERT writing outreach for Levox Infotech.

${LEVOX_COMPANY_CONTEXT}

Analyze the following LinkedIn profile and generate HIGH-CONVERTING outreach messages.

PROFILE DATA:
${profileText}

THINK LIKE A STRATEGIST before writing:
1. What are they doing? Where are they weak? What are they missing?
2. Detect PAIN POINTS: weak website conversion, no clear branding, low visibility, poor UI/UX, no lead system, inconsistent marketing.
3. Identify their strength or a compliment about their business (detect from profile if possible).

${strategyBlock}

${LEVOX_OUTREACH_REQUIREMENTS}

${retryInstruction}

STRICT RULES:
- Output ONLY final messages (no explanations, no notes, no formatting symbols)
- Do NOT include *, #, ---, quotes, or extra text
- Write like a real human (natural, simple, conversational)
- Position Levox as premium (never as "cheap")

Output FORMAT:
[Message text]`;
}

function parseGeneratedMessages(rawResponse) {
    const normalized = rawResponse.replace(/\r/g, '').trim();
    const cleanedResponse = stripFormattingNoise(normalized);
    const connectionMatch = cleanedResponse.match(/Connection Message:\s*([\s\S]*?)(?:Follow-up Message:|$)/i);
    const followupMatch = cleanedResponse.match(/Follow-up Message:\s*([\s\S]*)$/i);

    let connection = connectionMatch ? connectionMatch[1].trim() : '';
    let followup = followupMatch ? followupMatch[1].trim() : '';

    if (!connection || !followup) {
        const fallbackParts = cleanedResponse
            .split(/\n{2,}/)
            .map(part => part.trim())
            .filter(Boolean);

        if (fallbackParts.length >= 2) {
            connection = connection || fallbackParts[0];
            followup = followup || fallbackParts.slice(1).join('\n\n');
        }
    }

    if (!connection || !followup) {
        throw new Error('The AI response could not be separated into connection and follow-up messages. Please try again.');
    }

    return { connection, followup };
}

async function callMistralAPI(prompt, maxTokens = 600) {
    const aiRefinementRules = `\n\nCRITICAL SYSTEM RULES (MUST OBEY):
1. Write 100% like a real human. Never use generic or robotic AI phrasing.
2. NEVER use ANY dash character: NO hyphens (-), NO em dashes (—), and NO en dashes (–). If making a list, use • or * instead. DO NOT connect words with hyphens.
3. Be specific, sharp, and value-driven. No fluff or typical AI filler phrases.
4. You MUST write this message strictly on behalf of Levox Infotech. You are offering Levox Infotech's services TO the prospect. DO NOT write on behalf of the prospect's company (e.g., Commerciax). Never mention Commerciax as the sender.`;

    const finalPrompt = prompt + aiRefinementRules;

    const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [
                {
                    role: 'user',
                    content: finalPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: maxTokens
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Mistral API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function cleanGeneratedMessageText(text, options = {}) {
    const preserveLineBreaks = Boolean(options.preserveLineBreaks);
    let cleaned = stripFormattingNoise(text || '');
    cleaned = removeExtraSections(cleaned);

    cleaned = cleaned
        .replace(/(^|\n)\s*[-*#]+\s*/g, '$1')
        .replace(/\*\*/g, '')
        .replace(/```/g, '')
        .replace(/["""]/g, '')
        .replace(/\s*[—–]\s*/g, ' ')  // Remove em-dashes and en-dashes
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (!preserveLineBreaks) {
        cleaned = cleaned.replace(/\s*\n\s*/g, ' ');
    }

    return cleaned.replace(/[ \t]{2,}/g, ' ').trim();
}

function stripFormattingNoise(text) {
    return (text || '')
        .replace(/\r/g, '')
        .replace(/^\s*Here(?:'s| is).*$\n?/gim, '')
        .replace(/^\s*(Connection Message|Follow-up Message)\s*-\s*Max.*$/gim, '')
        .replace(/^\s*(Connection Message|Follow-up Message)\s*:\s*$/gim, match => match.trim())
        .replace(/^\s*(Why this works|Why it works|Analysis|Tips|Notes?)\s*:?.*$/gim, '')
        .replace(/^\s*[-=]{3,}\s*$/gm, '')
        .trim();
}

function removeExtraSections(text) {
    const markers = [
        /\n\s*Why this works[\s\S]*$/i,
        /\n\s*Why it works[\s\S]*$/i,
        /\n\s*Analysis[\s\S]*$/i,
        /\n\s*Notes?[\s\S]*$/i,
        /\n\s*Tips?[\s\S]*$/i
    ];

    let cleaned = text;
    markers.forEach(marker => {
        cleaned = cleaned.replace(marker, '');
    });

    return cleaned.trim();
}

function trimToWordLimit(text, maxWords) {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) {
        return text.trim();
    }

    return `${words.slice(0, maxWords).join(' ').trim()}...`;
}

function parseStructuredChannelResponse(rawResponse, selectedMessageType) {
    const normalized = stripFormattingNoise((rawResponse || '').replace(/\r/g, '').trim());

    if (selectedMessageType === 'email') {
        return parseEmailResponse(normalized);
    }

    if (selectedMessageType === 'whatsapp') {
        return parseWhatsappResponse(normalized);
    }

    if (selectedMessageType === 'coldcall') {
        return parseColdCallScript(normalized);
    }

    throw new Error('Unsupported message type selected.');
}

function finalizeChannelMessages(messages, selectedMessageType) {
    if (selectedMessageType === 'email') {
        return finalizeEmailMessages(messages);
    }

    if (selectedMessageType === 'whatsapp') {
        return finalizeWhatsappMessages(messages);
    }

    if (selectedMessageType === 'coldcall') {
        return messages;
    }

    return finalizeGeneratedMessages(messages);
}

function buildChannelOutput(selectedMessageType, cleanedMessages) {
    if (selectedMessageType === 'email') {
        return buildEmailChannelOutput(cleanedMessages);
    }

    if (selectedMessageType === 'whatsapp') {
        return buildWhatsappChannelOutput(cleanedMessages);
    }

    if (selectedMessageType === 'coldcall') {
        return buildColdCallOutput(cleanedMessages);
    }

    // LinkedIn sub-type routing
    if (cleanedMessages._subType === 'connection_only') {
        return buildConnectionOnlyOutput(cleanedMessages);
    }
    if (cleanedMessages._subType === 'followup_reply') {
        return buildFollowupReplyOutput(cleanedMessages);
    }

    return buildLinkedinChannelOutput(cleanedMessages);
}

function buildRegenerateBar() {
    return `
        <div class="regenerate-bar">
            <button class="btn-regenerate" id="regenerateBtn" type="button" onclick="handleRegenerate()">
                <span class="spin-icon">🔄</span> Regenerate
            </button>
            <span style="color: var(--text-secondary); font-size: 0.88rem;">Not happy? Hit regenerate for a fresh version.</span>
        </div>
    `;
}

function renderResults(prospect, icpResult, messages) {
    const service = SERVICES[prospect.serviceFocus];
    const container = document.getElementById('outputContainer');

    // Preserve _subType through finalization
    const cleanedMessages = finalizeChannelMessages(messages, prospect.messageType);
    if (messages._subType) cleanedMessages._subType = messages._subType;

    const channelMeta = MESSAGE_TYPE_META[prospect.messageType] || MESSAGE_TYPE_META.linkedin;

    container.innerHTML = `
        ${buildRegenerateBar()}

        <div class="output-card show">
            <h3>
                📊 ICP Analysis
                <span class="badge ${icpResult.isMatch ? '' : 'warning'}">${icpResult.score}% Match</span>
            </h3>
            <div class="icp-analysis">
                ${icpResult.checks.map(check => `
                    <div class="icp-item ${!check.pass ? 'fail' : ''}">
                        <strong>${check.criteria}:</strong> ${check.detail}
                    </div>
                `).join('')}
                <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #bfdbfe;">
                    <strong>Recommendation:</strong> ${icpResult.recommendation}
                </div>
            </div>
        </div>

        <div class="output-card show">
            <h3>👤 Prospect Summary</h3>
            <p><strong>Name:</strong> ${prospect.name}</p>
            <p><strong>Role:</strong> ${prospect.title} at ${prospect.company}</p>
            ${prospect.industry ? `<p><strong>Industry:</strong> ${prospect.industry}</p>` : ''}
            ${prospect.location ? `<p><strong>Location:</strong> ${prospect.location}</p>` : ''}
            <p><strong>Channel:</strong> ${channelMeta.label}</p>
            <p><strong>Best-fit Angle:</strong> ${service.label}</p>
            ${prospect.websiteStatus && prospect.websiteStatus !== 'unknown' ? `<p><strong>Website:</strong> ${prospect.websiteStatus}</p>` : ''}
            ${prospect.socialActivity && prospect.socialActivity !== 'unknown' ? `<p><strong>Social Activity:</strong> ${prospect.socialActivity}</p>` : ''}
        </div>
        ${buildChannelOutput(prospect.messageType, cleanedMessages)}
    `;
}

function renderRawProfileResults(profileText, messages, selectedMessageType, subType) {
    const container = document.getElementById('outputContainer');

    // Preserve _subType through finalization
    const cleanedMessages = finalizeChannelMessages(messages, selectedMessageType);
    if (messages._subType) cleanedMessages._subType = messages._subType;

    const channelMeta = MESSAGE_TYPE_META[selectedMessageType] || MESSAGE_TYPE_META.linkedin;

    container.innerHTML = `
        ${buildRegenerateBar()}

        <div class="output-card show">
            <h3>${channelMeta.icon} ${channelMeta.label}</h3>
            <p style="color: #64748b; font-size: 0.95rem; line-height: 1.6;">Generated from the pasted profile text without changing your current inputs.</p>
        </div>
        ${buildChannelOutput(selectedMessageType, cleanedMessages)}
    `;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeTemplateLiteral(text) {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${');
}

function copyToClipboard(button, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.classList.add('copied');

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    });
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showElement('errorBox');
    hideElement('loadingBox');
}