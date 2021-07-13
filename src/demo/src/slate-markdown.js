const katex = require('katex');

function handler(md, pos, isInline) {
    /* eslint-disable no-fallthrough */
    /* eslint-disable no-labels */
    /* eslint-disable default-case */
    switch (md[pos]) {
        // BLOCK HANDLERS
        case '\n': {
            if (!isInline) {
                let numLines = 0;
                while (md[pos + numLines] === '\n') numLines++;
                return {
                    html: numLines <= 2 ? '' : '<br>',
                    consumed: numLines
                };
            }
            
            break;
        }
        case '#': {
            if (!isInline) { // Titles/Headers
                let numPounds = 0;
                while (md[pos + numPounds] === '#') numPounds++;
                
                // If the pound signs are followed by a space, consume that too.
                const withSpace = md[pos + numPounds] === ' ' ? numPounds + 1 : numPounds;
                
                let eol = md.indexOf('\n', pos + withSpace);
                if (eol === -1) eol = md.length; // If there are no newlines, consume the rest of the string
                
                if (numPounds > 6) numPounds = 6;
                
                const innerHTML = md.slice(pos + withSpace, eol);
                const html = `<h${numPounds}>${exports.toHTML(innerHTML, true)}</h${numPounds}>`;
                
                return {
                    html,
                    consumed: eol - pos
                };
            }
            
            break;
        }
        case '$': {
            displayMode:
            if (!isInline && md[pos + 1] === '$') { // Display math
                const nextDollarSign = md.indexOf('$$', pos + 2);
                if (nextDollarSign === -1) break displayMode;
                const content = md.slice(pos + 2, nextDollarSign);
                const html = katex.renderToString(content, {
                    throwOnError: false,
                    displayMode: true
                });
                return {
                    html,
                    consumed: nextDollarSign - pos + 2
                };
            }
            
            if (isInline) { // Inline math
                const nextDollarSign = md.indexOf('$', pos + 1);
                if (nextDollarSign === -1) break;
                const content = md.slice(pos + 1, nextDollarSign);
                const html = katex.renderToString(content, {
                    throwOnError: false
                });
                return {
                    html,
                    consumed: nextDollarSign - pos + 1
                };
            }
            
            break;
        }
        case '-': {
            if (!isInline) {
                let els = []; // Stores the text of each line.
                
                let i = pos;
                while (md[i] === '-') { // Loop through lines
                    let numHyphens = 0;
                    while (md[i] === '-') {
                        i++;
                        numHyphens++;
                    }
                    
                    let eol = md.indexOf('\n', i);
                    if (eol === -1) eol = md.length;
                    const withSpace = md[i] === ' ' ? i + 1 : i;
                    els.push([
                        numHyphens,
                        md.slice(withSpace, eol)
                    ]);
                    if (eol === md.length) {
                        i = md.length;
                        break;
                    }
                    i = eol + 1;
                }
                
                let currentIndentationLevel = 0;
                let html = '';
                for (let i = 0; i < els.length;) {
                    if (els[i][0] < currentIndentationLevel) {
                        html += '</ul>';
                        currentIndentationLevel--;
                    } else if (els[i][0] > currentIndentationLevel) {
                        html += '<ul>';
                        currentIndentationLevel++;
                    } else {
                        html += `<li>${exports.toHTML(els[i][1], true)}</li>`;
                        i++;
                    }
                }
                while (currentIndentationLevel !== 0) {
                    html += '</ul>';
                    currentIndentationLevel--;
                }
                
                return {
                    html,
                    consumed: i - pos
                };
            } else if (md[pos + 1] === '-') { // Strikethrough
                const nextHyphen = md.indexOf('--', pos + 2);
                if (nextHyphen === -1) break;
                const content = md.slice(pos + 2, nextHyphen);
                return {
                    html: `<s>${exports.toHTML(content, true)}</s>`,
                    consumed: nextHyphen - pos + 2
                };
            }
            
            break;
        }
        
        // INLINE HANDLERS
        case '\\': {
            if (md.slice(pos + 1, pos + 7) === 'begin{') {
                const endArgs = md.indexOf('}', pos + 7);
                if (endArgs === -1) break;
                const arg = md.slice(pos + 7, endArgs);
                
                const end = md.indexOf(`\\end{${arg}}`, endArgs + 1);
                if (end === -1) break;
                const content = md.slice(endArgs + 2, end);
                
                switch (arg) {
                    case 'aside': {
                        const html = `<div class="aside">${exports.toHTML(content)}</div>`;
                        return {
                            html,
                            consumed: end + arg.length + 6 - pos
                        }
                    }
                    case 'labelledlist': {
                        let html = '<div class="labelled-list">';
                        let i = endArgs + 2;
                        
                        while (true) {
                            const split = md.indexOf(' & ', i);
                            if (split === -1) break;
                            const eol = md.indexOf('\n', split + 1);
                            if (eol === -1) break;
                            
                            html += `<p>${exports.toHTML(md.slice(i, split), true)}</p>`;
                            html += `<p>${exports.toHTML(md.slice(split + 3, eol), true)}</p>`;
                            
                            i = eol + 1;
                        }
                        html += '</div>';
                        
                        return {
                            html,
                            consumed: end + arg.length + 6 - pos
                        };
                    }
                }
            }
            
            break;
        }
        case '*': { // Bold
            if (isInline && md[pos + 1] === '*') {
                const nextAsterisk = md.indexOf('**', pos + 2);
                if (nextAsterisk === -1) break;
                const content = md.slice(pos + 2, nextAsterisk);
                return {
                    html: `<b>${exports.toHTML(content, true)}</b>`,
                    consumed: nextAsterisk - pos + 2
                };
            }
            
            break;
        }
        case '_': { // Italics
            if (isInline && md[pos + 1] === '_') {
                const nextUnderscore = md.indexOf('__', pos + 2);
                if (nextUnderscore === -1) break;
                const content = md.slice(pos + 2, nextUnderscore);
                return {
                    html: `<i>${exports.toHTML(content, true)}</i>`,
                    consumed: nextUnderscore - pos + 2
                };
            }
            
            break;
        }
        
        // CHARACTER ESCAPES
        case '&': {
            if (isInline) {
                return {
                    html: '&amp;',
                    consumed: 1
                };
            }
            break;
        }
        case '<': {
            if (isInline) {
                return {
                    html: '&lt;',
                    consumed: 1
                };
            }
            break;
        }
        case '>': {
            if (isInline) {
                return {
                    html: '&gt;',
                    consumed: 1
                };
            }
            break;
        }
        case '"': {
            if (isInline) {
                return {
                    html: '&quot;',
                    consumed: 1
                };
            }
            break;
        }
        case '\'': {
            if (isInline) {
                return {
                    html: '&#x27;',
                    consumed: 1
                };
            }
            break;
        }
    }
    
    if (isInline) {
        return {
            html: md[pos],
            consumed: 1
        };
    } else {
        let eol = md.indexOf('\n', pos + 1);
        if (eol === -1) {
            eol = md.length; // If there are no newlines, consume the rest of the string
        }
        
        const innerHTML = md.slice(pos, eol);
        const html = `<p>${exports.toHTML(innerHTML, true)}</p>`;
        
        return {
            html,
            consumed: eol - pos
        };
    }
}

/**
 * Converts Slate Markdown to renderable HTML.
 * @param {string} md - The Markdown to parse.
 * @param {boolean} inline - Whether or not the Markdown should be parsed as inline or not.
 */
exports.toHTML = (md, isInline) => {
    let html = '';
    
    for (let i = 0; i < md.length;) {
        const parseData = handler(md, i, isInline);
        
        html += parseData.html;
        i += parseData.consumed;
    }
    
    if (!isInline) {
        html = html.replace(/(?<!<[^>]*)\//g, '&#x2F;');
        html = html.replace(/(?<!<[^>]*)\\/g, '&#x5C;');
        html = html.replace(/\n\n/g, '<br>');
    }
    
    return html;
};
