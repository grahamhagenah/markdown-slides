import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import MarkdownIt from 'markdown-it'
import MdEditor, { Plugins } from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import logo from './logo.svg'
import { instructions } from './instructions.js'

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */)

// Remove options from editor 
MdEditor.unuse(Plugins.FullScreen) // full screen
MdEditor.unuse(Plugins.ModeToggle) // mode toggle

function App() {
  
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState([0])
  const [legend, setLegend] = useState([])

  // Accessing the contents of the `slides` state variable
  const currentSlide = current

  // Accessing the contents of the `slides` state variable
  const currentSlides = slides

  // Accessing the contents of the `legend` state variable
  const currentLegend = legend

  
  function handleEditorChange({ text }) {
    // Split the markdown text by lines
    const lines = text.split('\n')
    const legend = []
    const sections = []
    let currentSection = []

    lines.forEach((line, index) => {
      if (((line.startsWith('# ') || line.startsWith('## ')) && (currentSection.length > 0))) {
        legend.push(line)
        // When a new H2 heading is found, join the current section lines and push to sections
        sections.push(currentSection.join('\n'))
        // Reset the current section
        currentSection = [line]
        console.log("before" + sections)
        // First encounter, likely an H1 with no content in currentSection
      } else if (((line.startsWith('# ') || line.startsWith('## ')) && (currentSection.length === 0))) {
        legend.push(line)
        currentSection = [line]
      }
      else {
        // Otherwise, add the line to the current section
        currentSection.push(line)
      }
      // If it's the last line, add the remaining content as a section
      if (index === lines.length - 1) {
        sections.push(currentSection.join('\n'))
      }
    });

    setSlides(sections)
    setLegend(legend)
  }
  
  return (
    <div className="App">
      <img src={logo} className="logo" alt="Logo" />
      <div className="slide-view">
        <div className="legend">
          {currentLegend.map((title, index) => (
             <div className="title-container" onClick={() => setCurrent(index)} >
                <ReactMarkdown className="title" key={index} remarkPlugins={[gfm]} children={title} />
              </div>
            ))}
        </div>
        <ReactMarkdown className="slide" remarkPlugins={[gfm]} children={currentSlides[currentSlide]} />
      </div>
      <div className="markdown-view">
        <MdEditor id="editor" style={{ height: '100%' }} renderHTML={text => mdParser.render(text)} placeholder={instructions} view={{ menu: true, md: true, html: false }} onChange={handleEditorChange} />
      </div>
    </div>
  );
}

export default App;

