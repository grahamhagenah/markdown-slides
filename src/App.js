import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import MarkdownIt from 'markdown-it'
import MdEditor, { Plugins } from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import logo from './logo.svg'
import { instructions } from './instructions.js'
import classNames from 'classnames/bind';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

// Remove options from editor 
MdEditor.unuse(Plugins.FullScreen) // full screen
MdEditor.unuse(Plugins.ModeToggle) // mode toggle

const App = () => {

  const handle = useFullScreenHandle();
  
  const [slides, setSlides] = useState([])
  const [beforeEditSlides, setbeforeEditSlides] = useState([])
  // const [inputValue, setInputValue] = useState("example value")
  const [current, setCurrent] = useState([0])
  const [legend, setLegend] = useState([])

  // Accessing the contents of the state variables
  const currentSlide = current
  const currentSlides = slides
  const beforeEdit = beforeEditSlides
  const currentLegend = legend
  
  function findChangedIndex(before, after) {
    // Check if the arrays are of different lengths
    if (before.length !== after.length) {
      return -1; // Indicates that the arrays have different lengths
    }
  
    // Compare the elements of the arrays
    for (let i = 0; i < before.length; i++) {
      if (before[i] !== after[i]) {
        return i; // Return the index of the first difference found
      }
    }
    // If the arrays are identical
    return -1; // Indicates that there are no changes
  }


  function handleEditorChange({ text }) {

    // Captures state of current slides for later comparison
    setbeforeEditSlides(currentSlides)

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
    setCurrent(findChangedIndex(beforeEdit, currentSlides))
  }

  function enterFullScreen() {
    const element = document.getElementById("presentation-area") // Get the root HTML element
  
    if (element.requestFullscreen) {
      element.requestFullscreen(); // Request full-screen mode
    }
  }

  return (
    <div className="App">
      <img src={logo} className="logo" alt="Logo" />
      <div className="slide-view">
        <div className="legend">
          {currentLegend.map((title, index) => (
             <div key={'slide-' + index} className="title-container" onClick={() => setCurrent(index)} >
                <ReactMarkdown className={(currentSlide == index) ? ('current-slide title')  : 'title'}  key={index} remarkPlugins={[gfm]} children={title} />
              </div>
            ))}
        </div>
        <FullScreen handle={handle}>
          <ReactMarkdown id="presentation-area" className="slide" remarkPlugins={[gfm]} children={currentSlides[currentSlide]} />
          <div className="controls">
            <button className="fullscreen-toggle" onClick={handle.enter}>Enter fullscreen</button>
            <button className="next-slide" onClick={() => (slides.length - 1 > current) && setCurrent(current + 1)}>Next</button>
            <button className="previous-slide" onClick={() => (current > 0) && setCurrent(current - 1)}>Previous</button>
          </div>
        </FullScreen>
      </div>
      <div className="markdown-view">
        <MdEditor id="editor" style={{ height: '100%' }}  view={{ menu: true, md: true, html: false }} renderHTML={text => mdParser.render(text)} onChange={handleEditorChange} />
      </div>
    </div>
  );
}

export default App;

