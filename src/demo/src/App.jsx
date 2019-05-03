import React from 'react';

import {toHTML} from './slate-markdown';

import './App.css';

function App() {
    const [text, setText] = React.useState('');
    
    return (
        <div className="app">
            <div className="input">
                <textarea onChange={e => {
                    setText(e.target.value);
                }}></textarea>
            </div>
            <div className="output"
                 dangerouslySetInnerHTML={{__html: toHTML(text)}} />
        </div>
    );
}

export default App;
    