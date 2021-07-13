import React from 'react';

import {toHTML} from './slate-markdown';

import './App.css';

const render = text => {
    const t1 = performance.now();
    const html = toHTML(text);
    const t2 = performance.now();
    
    return {
        html,
        time: t2 - t1
    };
};

function App() {
    const [text, setText] = React.useState('');
    
    const rendered = render(text);
    
    return (
        <div className="app">
            <div className="input">
                <textarea onChange={e => {
                    setText(e.target.value);
                }}></textarea>
            </div>
            <div className="output">
                <p>Took {Math.round(rendered.time)} milliseconds to render.</p>
                <article dangerouslySetInnerHTML={{__html: rendered.html}} />
            </div>
        </div>
    );
}

export default App;
    