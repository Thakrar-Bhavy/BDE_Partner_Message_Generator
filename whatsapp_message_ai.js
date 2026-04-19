function finalizeWhatsappMessages(messages) {
    return {
        message: sanitizeWhatsappMessage(messages.message)
    };
}

function parseWhatsappResponse(normalized) {
    const messageMatch = normalized.match(/WhatsApp Message:\s*([\s\S]*)$/i);
    const message = messageMatch ? messageMatch[1].trim() : normalized.trim();

    if (!message) {
        throw new Error('The AI response could not be separated into a WhatsApp message. Please try again.');
    }

    return { message };
}

function buildWhatsappChannelOutput(cleanedMessages) {
    const messageForCopy = escapeTemplateLiteral(cleanedMessages.message);

    return `
        <div class="output-card show">
            <h3>&#128172; WhatsApp Message</h3>
            <div class="message-box connection">
                <div class="message-text">${escapeHtml(cleanedMessages.message)}</div>
                <div class="char-count">${cleanedMessages.message.length} characters</div>
                <button class="copy-btn" onclick="copyToClipboard(this, \`${messageForCopy}\`)">Copy Message</button>
            </div>
        </div>
    `;
}

function sanitizeWhatsappMessage(text) {
    const cleaned = cleanGeneratedMessageText(text, { preserveLineBreaks: true })
        .replace(/^whatsapp message:\s*/i, '');

    const lines = cleaned
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .slice(0, 4);

    return lines.join('\n').trim();
}