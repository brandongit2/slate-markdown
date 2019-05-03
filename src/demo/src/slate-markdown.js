const katex = require('katex');

exports.toHTML = md => {
    let html = md;
    
    html = html.replace(/&/g, '&amp;');
    html = html.replace(/</g, '&lt;');
    html = html.replace(/>/g, '&gt;');
    html = html.replace(/"/g, '&quot;');
    html = html.replace(/'/g, '&#x27;');
    html = html.replace(/\//g, '&#x2F;');
    
    // Newlines
    html = html.replace(/(\r\n|\r|\n){2}/g, '<br>');
    
    // Titles
    html = html.replace(/^#{6,} *(.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#{5} *(.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#{4} *(.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^#{3} *(.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^#{2} *(.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# ?(.*)$/gm, '<h1>$1</h1>');
    
    html = html.replace(/(?<!\\)\*(.+)(?<!\\)\*/g, '<b>$1</b>');
    html = html.replace(/(?<!\\)_(.+)(?<!\\)_/g, '<i>$1</i>');
    html = html.replace(/(?<!\\)--(.+)(?<!\\)--/g, '<s>$1</s>');
    
    // Math
    html = html.replace(/\$\$(.+?)\$\$/g, (match, p1) => (
        katex.renderToString(p1, {
            throwOnError: false,
            displayMode: true
        })
    ));
    html = html.replace(/(?<!\\)\$(.+?)(?<!\\)\$/g, (match, p1) => (
        katex.renderToString(p1, {throwOnError: false})
    ));
    
    // Spaces
    html = html.replace(/(?<!<[^>]*) /gm, '&nbsp;');
    
    return html;
};
