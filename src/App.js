import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import MarkdownIt from 'markdown-it'
import Editor, { Plugins } from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'
import logo from './logo.svg'
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import IconButton from '@mui/material/IconButton'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import AddIcon from '@mui/icons-material/Add';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import {demo} from './demo.js'

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */)

// Remove options from editor 
Editor.unuse(Plugins.FullScreen) // full screen
Editor.unuse(Plugins.ModeToggle) // mode toggle

export default function App() {

  const handle = useFullScreenHandle() // Enable fullscreen options
  document.onkeydown = navigateSlides  // Allow navigation by arrow keys
  
  const mdEditor = React.useRef(null);

  const [slides, setSlides] = useState([])
  const [stashedSlides, setStash] = useState([])
  const [current, setCurrent] = useState([0])
  const [legend, setLegend] = useState([])

  // State variables
  let currentSlide = current
  let currentSlides = slides
  let stash = stashedSlides
  let nav = legend
 
  useEffect(() => {
    mdEditor.current.setText(demo)
    setCurrent(0)
  }, []);
  
  function findChangedIndex(before, after) {

    if(before.length === 0) {
      return 0
    }

    // User added content, find index
    if(before.length < after.length) {
      for (let i = 0; i < before.length; i++) {
        if (before[i] !== after[i]) {
          return i + 1 // Return index of the first difference found, indicating content added before
        }
      }
      return before.length + 1 // Return one index beyond before array, indicating content added after

    }

    // User deleted content, find index
    if(before.length > after.length) {
      for (let i = 0; i < after.length; i++) {
        if (before[i] !== after[i]) {
          return i // Return index of the first difference found, indicating content added before end
        }
      }
      return after.length + 1 // Return one index beyond before array, indicating content added after
    }

    // User edited content, find index
    if(before.length === after.length) {
      for (let i = 0; i < after.length; i++) {
        if (before[i] !== after[i]) {
          return i // Return index of the first difference found, indicating content added before end
        }
      }
    }
  }

  const handleEditorChange = ({text}) => {
    
    setStash(currentSlides) // Captures state of current slides for later comparison

    // Split the markdown text by lines
    let lines = text.split('\n')
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

    setCurrent(findChangedIndex(stash, currentSlides))
    setSlides(sections)
    setLegend(legend)
  }

  function createSlide() {
    // Focus on last character in editor to ensure new slide is inserted last
    focusLastCharacter('editor_md');
    mdEditor.current.insertText('\n\n## New Slide\nAdd content here')
  }

  function focusLastCharacter(textareaId) {
    let textarea = document.getElementById(textareaId);
    if (textarea) {
      let length = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(length, length);
    }
}

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
    <>
    <header>
      <a href="/">
        <img src={logo} className="logo" alt="Logo" />
      </a>
    </header>
    <main>
      <nav>
        <ol>
          {nav.map((title, index) => (
            <li key={index} onClick={() => setCurrent(index)}>
              <ReactMarkdown className={(currentSlide === index) ? ('current-slide title')  : 'title'}  key={index} remarkPlugins={[gfm]} children={title} />
            </li>
          ))}
        </ol>
        <div className="button-container">
        </div>
      </nav>
      <div className="slide-view">
        <FullScreen handle={handle}>
          <div className="counter">
            <p>{(currentSlide + 1) + " / " +  slides.length}</p>
          </div>
          <div className="slide">
            <section id="controls">
                <IconButton aria-label="Previous Slide" size="large" className="previous-slide" onClick={() => (current > 0) && setCurrent(current - 1)}>
                  <ArrowBackIcon/>
                </IconButton>
                <IconButton aria-label="Enter Fullscreen" className="fullscreen-enter" onClick={handle.enter}>
                  <FullscreenIcon />
                </IconButton>
                <IconButton aria-label="Exit Fullscreen" className="fullscreen-exit" onClick={handle.exit}>
                  <FullscreenExitIcon />
                </IconButton>
                <IconButton aria-label="New Slide" size="large" className="new-slide" onClick={createSlide}>
                  <AddIcon/>
                </IconButton>
                <IconButton aria-label="Dark Mode Toggle" size="large" className="mode-toggle" onClick={() => document.body.classList.toggle("dark-theme")}>
                  <Brightness4Icon/>
                </IconButton>
                <IconButton aria-label="Next Slide" size="large" onClick={() => (slides.length - 1 > current) && setCurrent(current + 1)}>
                  <ArrowForwardIcon/>
                </IconButton>
              </section>
            <ReactMarkdown className="slide-content" remarkPlugins={[gfm]} children={currentSlides[currentSlide]} />
          </div>
        </FullScreen>
      </div>
      <div className="markdown-view">
        <Editor ref={mdEditor} id="editor" style={{ height: '100%' }}  view={{ menu: true, md: true, html: false }} renderHTML={text => mdParser.render(text)} onChange={handleEditorChange} />
      </div>
    </main>
    </>
  )
}

