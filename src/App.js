import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import MarkdownIt from 'markdown-it';
import MdEditor, { Plugins } from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import logo from './logo.svg';

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// Remove options from editor 
MdEditor.unuse(Plugins.FullScreen); // header
MdEditor.unuse(Plugins.ModeToggle); // mode toggle

function App() {
  
  // const [markdown, setMarkdown] = useState();
  const [slides, setSlides] = useState([])
  const [legend, setLegend] = useState([])
  // const [currentSlide, setCurrentSlide] = useState(0)

  // Accessing the contents of the `slides` state variable
  const currentSlides = slides;

  // Accessing the contents of the `legend` state variable
  const currentLegend = legend;

  
  function handleEditorChange({ text }) {
    // Split the markdown text by lines
    const lines = text.split('\n');
    const legend = [];
    const sections = [];
    let currentSection = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('## ') && currentSection.length > 0) {
        legend.push(line)
        // When a new H2 heading is found, push the title to the legend, then join the current section lines and push to sections
        sections.push(currentSection.join('\n'));
        // Reset the current section
        currentSection = [line];
      } else {
        // Otherwise, add the line to the current section
        currentSection.push(line);
      }
      
      // If it's the last line, add the remaining content as a section
      if (index === lines.length - 1) {
        sections.push(currentSection.join('\n'));
      }
    });
  
    console.log("sections: " + sections);
    console.log("legend: " + legend);
    setSlides(sections)
    setLegend(legend)
  }
  
  return (
    <div className="App">
      <img src={logo} className="logo" alt="Logo" />
      <div className="slide-view">
        <div className="legend">
          {currentLegend.map((title, index) => (
              <ReactMarkdown className="title" key={index} remarkPlugins={[gfm]} children={title} />
            ))}
        </div>
        <div className="slides">
            {currentSlides.map((slide, index) => (
              <ReactMarkdown className="slide" key={index} remarkPlugins={[gfm]} children={slide} />
            ))}
          </div>
      </div>
      <div className="markdown-view">
        <MdEditor style={{ height: '100vh' }} renderHTML={text => mdParser.render(text)} onChange={handleEditorChange} enablePreview={false} />
      </div>
    </div>
  );
}

export default App;

