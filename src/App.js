import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

function App() {
  // const [markdown, setMarkdown] = useState();
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)

   // Accessing the contents of the `slides` state variable
  const currentSlides = slides;

  // Function to change slides based on some condition or input
  // const changeSlide = (newMarkdown) => {
  //   setMarkdown(newMarkdown);
  // };
  
  function handleEditorChange({ html, text }) {

    // Split the markdown text by lines
    const lines = text.split('\n');
    const sections = [];
    let currentSection = [];
    
    lines.forEach((line, index) => {
      if (line.startsWith('## ') && currentSection.length > 0) {
        // When a new H2 heading is found, join the current section lines and push to sections
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
  
    console.log(sections);
  
    setSlides(sections);

}
  
  return (
    <div className="App">
      <div className="slide-view">
       <div className="slides">
          {currentSlides.map((slide, index) => (
            <ReactMarkdown className="slide" key={index} remarkPlugins={[gfm]} children={slide}/>
          ))}
        </div>
        {/* <button onClick={() => changeSlide("# Slide 2\n\nThis is the second slide content.")}>Next Slide</button> */}
      </div>
      <div className="markdown-view">
        <MdEditor style={{ height: '100vh' }} renderHTML={text => mdParser.render(text)} onChange={handleEditorChange} />
      </div>
    </div>
  );
}

export default App;

