import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import MarkdownIt from 'markdown-it'
import MdEditor, { Plugins } from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import logo from './logo.svg'
import { instructions } from './instructions.js'
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */)

// Remove options from editor 
MdEditor.unuse(Plugins.FullScreen) // full screen
MdEditor.unuse(Plugins.ModeToggle) // mode toggle

const App = () => {

  const handle = useFullScreenHandle()
  
  const [slides, setSlides] = useState([])
  const [markdown, setMarkdown] = useState(instructions)
  const [beforeEditSlides, setbeforeEditSlides] = useState([])
  const [current, setCurrent] = useState([0])
  const [legend, setLegend] = useState([])

  // Accessing the contents of the state variables
  const currentSlide = current
  let initial = markdown
  const currentSlides = slides
  const beforeEdit = beforeEditSlides
  const currentLegend = legend
 
  useEffect(() => {

    setUpDemo(initial)
    
 }, []);
  
  function findChangedIndex(before, after) {
    // Check if the arrays are of different lengths
    if (before.length !== after.length) {
      return 0 // Indicates that the arrays have different lengths
    }
  
    // Compare the elements of the arrays
    for (let i = 0; i < before.length; i++) {
      if (before[i] !== after[i]) {
        return i // Return the index of the first difference found
      }
    }
    // If the arrays are identical
    return -1 // Indicates that there are no changes
  }

  const setUpDemo = (text) => {

    setMarkdown(text)

    // Captures state of current slides for later comparison
    setbeforeEditSlides(currentSlides)

    // Split the markdown text by lines
    const lines = text.split('\n')
    let legend = []
    let sections = []
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
    })

    setSlides(sections)
    setLegend(legend)
    setCurrent(0)
  }

  const handleEditorChange = ({text}) => {

    setMarkdown(text)

    // Captures state of current slides for later comparison
    setbeforeEditSlides(currentSlides)

    // Split the markdown text by lines
    const lines = text.split('\n')
    let legend = []
    let sections = []
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
    })

    setSlides(sections)
    setLegend(legend)
    setCurrent(findChangedIndex(beforeEdit, currentSlides))
  }

  // Allow navigation by arrow keys
  document.onkeydown = navigateSlides

  function navigateSlides(e) {
    if(document.activeElement !== document.getElementById('editor_md')) {
      if (e.keyCode == '38' || e.keyCode == '37') {
        return (current > 0) && setCurrent(current - 1)
      }
      else if (e.keyCode == '40' || e.keyCode == '39') {
        return (slides.length - 1 > current) && setCurrent(current + 1)
      }
    }
  }

  return (
    <div className="App">
      <img src={logo} className="logo" alt="Logo" />
      <div className="slide-view">
        <div className="legend">
          {currentLegend.map((title, index) => (
             <div key={'slide-' + index} className="title-container" onClick={() => setCurrent(index)}>
                <ReactMarkdown className={(currentSlide === index) ? ('current-slide title')  : 'title'}  key={index} remarkPlugins={[gfm]} children={title} />
              </div>
            ))}
        </div>
        <FullScreen handle={handle}>
          <div className="counter">
            <p>{slides.length + " / " +  (currentSlide + 1)}</p>
          </div>
          <div className="slide">
            <ReactMarkdown id="presentation-area" className="slide-content" remarkPlugins={[gfm]} children={currentSlides[currentSlide]} />
          </div>
          <div className="controls">
            <IconButton aria-label="delete" size="large" className="previous-slide" onClick={() => (current > 0) && setCurrent(current - 1)}>
              <ArrowBackIcon/>
            </IconButton>
            <IconButton className="fullscreen-enter" onClick={handle.enter}>
              <FullscreenIcon />
            </IconButton>
            <IconButton className="fullscreen-exit" onClick={handle.exit}>
              <FullscreenExitIcon />
            </IconButton>
            <IconButton aria-label="delete" size="large" className="next-slide" onClick={() => (slides.length - 1 > current) && setCurrent(current + 1)}>
              <ArrowForwardIcon/>
            </IconButton>
          </div>
        </FullScreen>
      </div>
      <div className="markdown-view">
        <MdEditor id="editor" style={{ height: '100%' }}  view={{ menu: true, md: true, html: false }} value={initial} renderHTML={text => mdParser.render(text)} onChange={handleEditorChange} />
      </div>
    </div>
  )
}

export default App

