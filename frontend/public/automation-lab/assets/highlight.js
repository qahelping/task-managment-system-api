// Simple code highlighter (no external dependencies)
(function() {
    'use strict';

    function highlightCode(code) {
        // Python keywords
        const pythonKeywords = /\b(def|class|import|from|if|elif|else|for|while|try|except|finally|with|as|return|yield|pass|break|continue|assert|lambda|and|or|not|in|is|True|False|None|await|async)\b/g;
        
        // TypeScript/JavaScript keywords
        const jsKeywords = /\b(const|let|var|function|class|interface|type|enum|import|export|from|if|else|for|while|try|catch|finally|async|await|return|yield|break|continue|switch|case|default|new|this|super|extends|implements|static|public|private|protected|readonly|abstract|typeof|instanceof|void|null|undefined|true|false)\b/g;
        
        // Common patterns
        const strings = /(['"`])(?:(?=(\\?))\2.)*?\1/g;
        const comments = /(#.*$|\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
        const numbers = /\b\d+\.?\d*\b/g;
        const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g;

        let highlighted = code;

        // Highlight comments first (so they don't get highlighted as other things)
        highlighted = highlighted.replace(comments, (match) => {
            return `<span class="comment">${escapeHtml(match)}</span>`;
        });

        // Highlight strings
        highlighted = highlighted.replace(strings, (match) => {
            return `<span class="string">${escapeHtml(match)}</span>`;
        });

        // Highlight Python code
        if (code.includes('from selenium') || code.includes('WebDriverWait') || code.includes('driver.')) {
            highlighted = highlighted.replace(pythonKeywords, (match) => {
                return `<span class="keyword">${escapeHtml(match)}</span>`;
            });
        }

        // Highlight TypeScript/JavaScript code
        if (code.includes('await') || code.includes('page.') || code.includes('locator(') || code.includes('expect(')) {
            highlighted = highlighted.replace(jsKeywords, (match) => {
                return `<span class="keyword">${escapeHtml(match)}</span>`;
            });
        }

        // Highlight function calls
        highlighted = highlighted.replace(functions, (match) => {
            if (!match.includes('<span')) {
                return `<span class="function">${escapeHtml(match)}</span>`;
            }
            return match;
        });

        // Highlight numbers
        highlighted = highlighted.replace(numbers, (match) => {
            if (!match.includes('<span')) {
                return `<span class="number">${escapeHtml(match)}</span>`;
            }
            return match;
        });

        return highlighted;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Auto-highlight code blocks
    function initHighlighting() {
        const codeBlocks = document.querySelectorAll('.code-block');
        codeBlocks.forEach(block => {
            if (!block.dataset.highlighted) {
                const code = block.textContent;
                block.innerHTML = highlightCode(code);
                block.dataset.highlighted = 'true';
            }
        });
    }

    // Run on load and after dynamic content
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHighlighting);
    } else {
        initHighlighting();
    }

    // Re-run after a delay to catch dynamically added code
    setTimeout(initHighlighting, 500);
    setTimeout(initHighlighting, 1000);

    // Export for manual use
    window.highlightCode = highlightCode;
})();

