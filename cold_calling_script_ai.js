function parseColdCallScript(rawText) {
    const sections = {
        opening: '',
        interestHook: '',
        questions: '',
        pitch: '',
        objectionNotInterested: '',
        objectionNoBudget: '',
        objectionHaveTeam: '',
        closing: ''
    };

    const patterns = [
        { key: 'opening', regex: /OPENING LINE:\s*([\s\S]*?)(?=INTEREST HOOK:|$)/i },
        { key: 'interestHook', regex: /INTEREST HOOK:\s*([\s\S]*?)(?=DISCOVERY QUESTIONS:|$)/i },
        { key: 'questions', regex: /DISCOVERY QUESTIONS:\s*([\s\S]*?)(?=PITCH:|$)/i },
        { key: 'pitch', regex: /PITCH:\s*([\s\S]*?)(?=OBJECTION[\s-]*NOT INTERESTED:|$)/i },
        { key: 'objectionNotInterested', regex: /OBJECTION[\s-]*NOT INTERESTED:\s*([\s\S]*?)(?=OBJECTION[\s-]*NO BUDGET:|$)/i },
        { key: 'objectionNoBudget', regex: /OBJECTION[\s-]*NO BUDGET:\s*([\s\S]*?)(?=OBJECTION[\s-]*ALREADY HAVE A TEAM:|OBJECTION[\s-]*ALREADY HAVE TEAM:|$)/i },
        { key: 'objectionHaveTeam', regex: /OBJECTION[\s-]*ALREADY HAVE (?:A )?TEAM:\s*([\s\S]*?)(?=CLOSING LINE:|$)/i },
        { key: 'closing', regex: /CLOSING LINE:\s*([\s\S]*)$/i }
    ];

    patterns.forEach(({ key, regex }) => {
        const match = rawText.match(regex);
        if (match) {
            sections[key] = cleanGeneratedMessageText(match[1], { preserveLineBreaks: true });
        }
    });

    // Validate we got at least opening and pitch
    if (!sections.opening && !sections.pitch) {
        throw new Error('The AI response could not be parsed into a cold call script. Please try again.');
    }

    return sections;
}

function buildColdCallOutput(script) {
    const fullScript = buildFullScriptText(script);
    const fullScriptForCopy = escapeTemplateLiteral(fullScript);

    const sectionConfigs = [
        { key: 'opening', label: '👋 Opening Line', cssClass: 'opening', icon: '1' },
        { key: 'interestHook', label: '🎯 Interest Hook (First 10 Seconds)', cssClass: 'interest', icon: '2' },
        { key: 'questions', label: '❓ Discovery Questions', cssClass: 'questions', icon: '3' },
        { key: 'pitch', label: '💪 Pitch (Short & Strong)', cssClass: 'pitch', icon: '4' },
    ];

    const objections = [
        { key: 'objectionNotInterested', label: '"Not interested"' },
        { key: 'objectionNoBudget', label: '"No budget right now"' },
        { key: 'objectionHaveTeam', label: '"We already have a team"' },
    ];

    let sectionsHTML = sectionConfigs.map(cfg => {
        const content = script[cfg.key] || '';
        if (!content) return '';
        return `
            <div class="script-section ${cfg.cssClass}">
                <div class="script-section-label">${cfg.label}</div>
                <div class="script-section-content">${escapeHtml(content)}</div>
            </div>
        `;
    }).join('');

    // Objections block
    const objectionsHTML = objections.map(obj => {
        const content = script[obj.key] || '';
        if (!content) return '';
        return `
            <div class="objection-item">
                <div class="objection-label">When they say: ${obj.label}</div>
                <div class="objection-response">${escapeHtml(content)}</div>
            </div>
        `;
    }).join('');

    if (objectionsHTML) {
        sectionsHTML += `
            <div class="script-section objections">
                <div class="script-section-label">🛡️ Objection Handling</div>
                ${objectionsHTML}
            </div>
        `;
    }

    // Closing
    if (script.closing) {
        sectionsHTML += `
            <div class="script-section closing">
                <div class="script-section-label">🤝 Closing (Book Meeting)</div>
                <div class="script-section-content">${escapeHtml(script.closing)}</div>
            </div>
        `;
    }

    return `
        <div class="output-card show">
            <h3>📞 Cold Call Script</h3>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 16px;">💡 Practice this script 2-3 times before calling. Adapt naturally — don't read word-for-word.</p>
            ${sectionsHTML}
            <button class="copy-full-script-btn" onclick="copyToClipboard(this, \`${fullScriptForCopy}\`)">📋 Copy Full Script</button>
        </div>
    `;
}

function buildFullScriptText(script) {
    let text = '';
    if (script.opening) text += `OPENING LINE:\n${script.opening}\n\n`;
    if (script.interestHook) text += `INTEREST HOOK:\n${script.interestHook}\n\n`;
    if (script.questions) text += `DISCOVERY QUESTIONS:\n${script.questions}\n\n`;
    if (script.pitch) text += `PITCH:\n${script.pitch}\n\n`;
    if (script.objectionNotInterested) text += `OBJECTION - "NOT INTERESTED":\n${script.objectionNotInterested}\n\n`;
    if (script.objectionNoBudget) text += `OBJECTION - "NO BUDGET":\n${script.objectionNoBudget}\n\n`;
    if (script.objectionHaveTeam) text += `OBJECTION - "ALREADY HAVE A TEAM":\n${script.objectionHaveTeam}\n\n`;
    if (script.closing) text += `CLOSING LINE:\n${script.closing}`;
    return text.trim();
}