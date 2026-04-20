function finalizeEmailMessages(messages) {
    return {
        subject: sanitizeEmailSubject(messages.subject),
        body: sanitizeEmailBody(messages.body)
    };
}

function parseEmailResponse(normalized) {
    const subjectMatch = normalized.match(/Subject Line:\s*([\s\S]*?)(?:Email Body:|$)/i);
    const bodyMatch = normalized.match(/Email Body:\s*([\s\S]*)$/i);
    const subject = subjectMatch ? subjectMatch[1].trim() : '';
    const body = bodyMatch ? bodyMatch[1].trim() : '';

    if (!subject || !body) {
        throw new Error('The AI response could not be separated into an email subject and body. Please try again.');
    }

    return { subject, body };
}

function buildEmailChannelOutput(cleanedMessages) {
    const subjectForCopy = escapeTemplateLiteral(cleanedMessages.subject);
    const bodyForCopy = escapeTemplateLiteral(cleanedMessages.body);

    return `
        <div class="output-card show">
            <h3>&#128231; Subject</h3>
            <div class="message-box connection">
                <div class="message-text">${escapeHtml(cleanedMessages.subject)}</div>
                <div class="char-count">${cleanedMessages.subject.length} characters</div>
                <button class="copy-btn" onclick="copyToClipboard(this, \`${subjectForCopy}\`)">Copy Subject</button>
            </div>
        </div>

        <div class="output-card show">
            <h3>&#128231; Email Body</h3>
            <div class="message-box followup">
                <div class="message-text">${escapeHtml(cleanedMessages.body)}</div>
                <div class="char-count">${cleanedMessages.body.length} characters</div>
                <button class="copy-btn" onclick="copyToClipboard(this, \`${bodyForCopy}\`)">Copy Email</button>
            </div>
        </div>
    `;
}

function sanitizeEmailSubject(text) {
    return cleanGeneratedMessageText(text, { preserveLineBreaks: false })
        .replace(/^subject line:\s*/i, '')
        .split('\n')[0]
        .trim();
}

function sanitizeEmailBody(text) {
    let cleaned = cleanGeneratedMessageText(text, { preserveLineBreaks: true });
    return cleaned.trim();
}
