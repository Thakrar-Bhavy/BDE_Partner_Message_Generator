function buildLinkedinChannelOutput(cleanedMessages) {
    const hasConnection = cleanedMessages.connection && cleanedMessages.connection.trim().length > 0;
    const connectionCharCount = hasConnection ? cleanedMessages.connection.length : 0;
    const isConnectionOverLimit = connectionCharCount > 300;
    const connectionForCopy = hasConnection ? escapeTemplateLiteral(cleanedMessages.connection) : '';
    const followupForCopy = escapeTemplateLiteral(cleanedMessages.followup);

    let html = '';

    if (hasConnection) {
        html += `
        <div class="output-card show">
            <h3>&#129309; Connection Request Message</h3>
            <div class="message-box connection">
                <div class="message-text">${escapeHtml(cleanedMessages.connection)}</div>
                <div class="char-count ${isConnectionOverLimit ? 'over-limit' : ''}">
                    ${connectionCharCount}/300 characters ${isConnectionOverLimit ? '&#9888; OVER LIMIT - Edit required!' : '&#10003;'}
                </div>
                <button class="copy-btn" onclick="copyToClipboard(this, \`${connectionForCopy}\`)">&#128203; Copy Message</button>
            </div>
            ${isConnectionOverLimit ? '<p style="color: #f87171; margin-top: 10px;"><strong>&#9888; Message exceeds LinkedIn\'s 300 character limit. Please edit before sending!</strong></p>' : ''}
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 10px;">&#128161; No sales pitch here - just genuine interest to connect. The pitch comes after they accept.</p>
        </div>
        `;
    }

    html += `
        <div class="output-card show">
            <h3>&#128188; First Message (After Acceptance)</h3>
            <div class="message-box followup">
                <div class="message-text">${escapeHtml(cleanedMessages.followup)}</div>
                <div class="char-count">${cleanedMessages.followup.length} characters</div>
                <button class="copy-btn" onclick="copyToClipboard(this, \`${followupForCopy}\`)">&#128203; Copy Message</button>
            </div>
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 10px;">&#128161; Send this 2-4 hours after they accept (not immediately). This is where you introduce your services.</p>
        </div>
    `;

    return html;
}

function buildConnectionOnlyOutput(cleanedMessages) {
    const text = cleanedMessages.connection || '';
    const charCount = text.length;
    const isOverLimit = charCount > 280;
    const textForCopy = escapeTemplateLiteral(text);

    return `
        <div class="output-card show">
            <h3>&#129309; Connection Note</h3>
            <div class="message-box connection">
                <div class="message-text">${escapeHtml(text)}</div>
                <div class="char-count ${isOverLimit ? 'over-limit' : ''}">
                    ${charCount}/280 characters ${isOverLimit ? '&#9888; OVER LIMIT - Edit required!' : '&#10003;'}
                </div>
                <button class="copy-btn" onclick="copyToClipboard(this, \`${textForCopy}\`)">&#128203; Copy Message</button>
            </div>
            ${isOverLimit ? '<p style="color: #f87171; margin-top: 10px;"><strong>&#9888; Message exceeds the 280 character limit. Please edit before sending!</strong></p>' : ''}
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 10px;">&#128161; Keep it warm and genuine — no selling, just curiosity. Make them want to accept.</p>
        </div>
    `;
}

function buildFollowupReplyOutput(cleanedMessages) {
    const text = cleanedMessages.followup || '';
    const textForCopy = escapeTemplateLiteral(text);

    return `
        <div class="output-card show">
            <h3>&#128260; Follow-up Reply</h3>
            <div class="message-box followup">
                <div class="message-text">${escapeHtml(text)}</div>
                <div class="char-count">${text.length} characters</div>
                <button class="copy-btn" onclick="copyToClipboard(this, \`${textForCopy}\`)">&#128203; Copy Message</button>
            </div>
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 10px;">&#128161; This continues your existing conversation naturally. Adds value without repeating your first message.</p>
        </div>
    `;
}

function finalizeGeneratedMessages(messages) {
    const result = {};
    if (messages.connection) {
        result.connection = sanitizeConnectionMessage(messages.connection);
    }
    if (messages.followup) {
        result.followup = sanitizeFollowupMessage(messages.followup);
    }
    return result;
}

function sanitizeConnectionMessage(text) {
    const cleaned = cleanGeneratedMessageText(text, { preserveLineBreaks: true });
    const limitedLines = cleaned
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .slice(0, 3)
        .join('\n');

    return trimConnectionMessage(limitedLines);
}

function sanitizeFollowupMessage(text) {
    let cleaned = cleanGeneratedMessageText(text, { preserveLineBreaks: true });
    cleaned = removeExtraSections(cleaned);

    // Don't force the CTA if the message already contains it
    if (!/open to a quick chat/i.test(cleaned)) {
        cleaned = ensureSoftCta(cleaned);
    }

    return cleaned;
}

function trimConnectionMessage(text) {
    let cleaned = (text || '').trim();
    if (cleaned.length <= 300) {
        return cleaned;
    }

    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    if (cleaned.length <= 300) {
        return cleaned;
    }

    const sentences = cleaned.match(/[^.!?]+[.!?]?/g) || [cleaned];
    let trimmed = '';

    for (const sentence of sentences) {
        const candidate = `${trimmed} ${sentence}`.trim();
        if (candidate.length > 300) break;
        trimmed = candidate;
    }

    if (trimmed) {
        return trimmed;
    }

    return `${cleaned.slice(0, 297).trim()}...`;
}

function trimToWordLimit(text, maxWords) {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) {
        return text.trim();
    }

    return `${words.slice(0, maxWords).join(' ').trim()}...`;
}

function ensureSoftCta(text) {
    const cta = 'Open to a quick chat?';
    let cleaned = text.trim();
    cleaned = cleaned.replace(/open to a quick chat\??/i, '').trim();
    cleaned = cleaned.replace(/[.,;:!?]+$/, '').trim();

    return `${cleaned}\n\n${cta}`.trim();
}
