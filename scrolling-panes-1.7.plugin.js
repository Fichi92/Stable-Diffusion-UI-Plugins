/*
    Scrolling Panes
    by Patrice

    Allows editor and preview panes to scroll independently. Also moves the footer to its own "About" tab in the top navbar (required to make the dual panes layout feel more natural).
*/
(function () {
    "use strict"

    var styleSheet = document.createElement("style")
    styleSheet.textContent = `
        @media (min-width: 700px) {
            body {
                overflow-y: hidden;
            }
            
            #top-nav {
                position: fixed;
                background: var(--background-color4);
                display: flex;
                width: 100%;
            }

            #editor {
                z-index: 1;
                width: min-content;
                min-width: 380pt;
                position: fixed;
                overflow-y: auto;
                top: 0;
                bottom: 0;
                left: 0;
            }
            #paneToggle:hover + #editor {
                transition: 0.25s;
            }
            
            #preview {
                position:  fixed;
                overflow-y: auto;
                top: 0;
                bottom: 0;
                left: 0;
                right:0;
                padding: 0 16px 0 16px;
                outline: none;
            }
            /*
            #paneToggle:hover ~ #preview {
                transition: 0.25s;
            }
            */
    
            #preview-tools {
                background: var(--background-color1);
                position: sticky;
                top: -100px; /* hide the toolbar by default */
                transition: 0.25s;
                z-index: 1;
                padding: 10px 10px 10px 10px;
                -webkit-mask-image: linear-gradient(to bottom, black 0%, black 90%, transparent 100%);
                mask-image: linear-gradient(to bottom, black 0%, black 90%, transparent 100%);
            }
        
            #editor-modifiers {
                overflow-y: initial;
                overflow-x: initial;
            }
            
            .image_preview_container {
                padding: 6px;
            }

            /* pane toggle */
            #paneToggleContainer {
                width: 8px;
                top: 0;
                left: 0;
                background: var(--background-color1);
                margin: 0;
                border-radius: 5px;
                position: fixed;
                z-index: 1000;
            }
            
            #paneToggle {
                width: 8px;
                height: 100px;
                left: 0;
                background: var(--background-color2);
                margin: 0;
                border-radius: 5px;
                position: relative;
                top: 50%;
                -ms-transform: translateY(-50%);
                transform: translateY(-50%);
            }
            
            .arrow-right {
                width: 0; 
                height: 0; 
                border-top: 8px solid transparent;
                border-bottom: 8px solid transparent;
                border-left: 8px solid var(--accent-color);
                
                margin: 0;
                position: absolute;
                top: 50%;
                -ms-transform: translateY(-50%);
                transform: translateY(-50%);
            }
            
            .arrow-left {
                width: 0; 
                height: 0; 
                border-top: 8px solid transparent;
                border-bottom: 8px solid transparent; 
                border-right:8px solid var(--accent-color);
                
                margin: 0;
                position: absolute;
                top: 50%;
                -ms-transform: translateY(-50%);
                transform: translateY(-50%);
            }
        }

        @media (max-width: 700px) {
            #hidden-top-nav {
                display: none;
            }
        }

        /* SCROLLBARS */
        :root {
            --scrollbar-width: 12px;
            --scrollbar-radius: 10px;
        }
        
        .scrollbar-preview::-webkit-scrollbar {
            width: var(--scrollbar-width);
        }
        
        .scrollbar-preview::-webkit-scrollbar-track {
            box-shadow: inset 0 0 5px var(--input-border-color);
            border-radius: var(--input-border-radius);
        }
        
        .scrollbar-preview::-webkit-scrollbar-thumb {
            background: var(--background-color2);
            border-radius: var(--scrollbar-radius);
        }
        
        ::-webkit-scrollbar {
            width: var(--scrollbar-width);
        }
        
        ::-webkit-scrollbar-track {
            box-shadow: inset 0 0 5px var(--input-border-color);
            border-radius: var(--input-border-radius);
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--background-color2);
            border-radius: var(--scrollbar-radius);
        }
    `
    document.head.appendChild(styleSheet)

    // move the footer to its own tab
    const topNavbar  = document.querySelector('#top-nav')
    const tabContainer = document.querySelector('#tab-container')
    tabContainer?.insertAdjacentHTML('beforeend', `
        <span id="tab-footer" class="tab">
            <span><i class="fa fa-circle-info icon"></i> About & Tip jar</span>
        </span>
    `)
    const tabFooter = document.querySelector('#tab-footer')
    document.querySelector('#tab-content-wrapper')?.insertAdjacentHTML('beforeend', `
        <div id="tab-content-footer" class="tab-content">
        </div>
    `)
    document.querySelector('#tab-content-footer').appendChild(document.querySelector('#footer'))
    document.querySelector('#footer-spacer').remove()
    document.querySelector('#footer .line-separator').remove()
    document.querySelector('#footer').style.fontSize = 'inherit'
    document.querySelector('#footer-legal').style.fontSize = 'inherit'
    linkTabContents(tabFooter)
    // create a placeholder header hidden behind the fixed header to push regular tab's content down in place
    const hiddenHeader = document.createElement('div')
    topNavbar.parentNode.insertBefore(hiddenHeader, topNavbar.nextSibling)
    hiddenHeader.id = 'hidden-top-nav'
    hiddenHeader.position = 'absolute'
    hiddenHeader.style.width = '100%'

    // create the arrow zone
    const editorContainer = document.querySelector('#editor')
    editorContainer.insertAdjacentHTML('beforebegin', `
        <div  id="paneToggleContainer">
            <div id="paneToggle">
                <div id="editorToggleArrow" class="arrow-left"></div>
            </div>
        </div>
    `)

    // update editor style and size
    const editorToggleContainer = document.querySelector('#paneToggleContainer')
    const editorToggleButton = document.querySelector('#paneToggle')
    const editorToggleArrow = document.querySelector('#editorToggleArrow')
    const editorModifiers = document.querySelector('#editor-modifiers')
    editorContainer.classList.add('pane-toggle')
    imagePreview.classList.add('scrollbar-preview')
    updatePreviewSize()

    /* EDITOR PANE TOGGLE */
    // restore the editor pane toggled state
    let editorPaneOpen = localStorage.getItem('editor_pane_open') == null ? true : localStorage.getItem('editor_pane_open') == 'true'
    if (!editorPaneOpen) {
        hideEditorPane()
    }

    function showEditorPane(showPreview) {
        if (editorPaneOpen) {
            editorToggleArrow.classList.remove('arrow-right')
            editorToggleArrow.classList.add('arrow-left')
        }
        editorContainer.style.left = '0px'
        if (showPreview) {
            updatePreviewSize(editorContainer.offsetWidth)
        }
    }

    function hideEditorPane(hideEditorPane) {
        if (!editorPaneOpen) {
            editorToggleArrow.classList.remove('arrow-left')
            editorToggleArrow.classList.add('arrow-right')
            editorContainer.style.left = -(editorContainer.offsetWidth) + 'px'
            updatePreviewSize(0)
        }
    }

    function toggleEditorPane() {
        if (editorPaneOpen) {
            editorPaneOpen = false
            hideEditorPane()
        }
        else
        {
            editorPaneOpen = true
            showEditorPane(true)
        }
        localStorage.setItem('editor_pane_open', editorPaneOpen)
    }
    editorToggleButton.addEventListener("click", () => toggleEditorPane())
    editorToggleButton.addEventListener("mouseenter", () => showEditorPane(false))
    editorToggleContainer.addEventListener("mouseenter", () => showEditorPane(false))
    editorContainer.addEventListener("mouseleave", () => hideEditorPane())

    /* PREVIEW TOOLBAR */
    function hideToolbar() {
        previewTools.style.top = -previewTools.offsetHeight + 'px'
    }
    let hideToolbarWithDelay = debounce(() => hideToolbar(), 3000)
    
    function showToolbar() {
        previewTools.style.top = '0'
        // hide the toolbar after some inactivity
        hideToolbarWithDelay()
    }

    // update toolbar visibility
    let yPos
    let scrollTop
    let lastScrollTop
    let sampling
    
    function touchStart() {
        yPos = undefined
        scrollTop = undefined
        lastScrollTop = undefined
        sampling = 0
    }
    imagePreview.addEventListener("touchstart", touchStart)
    //imagePreview.addEventListener("touchend", touchEnd)
    //imagePreview.addEventListener("touchcancel", touchEnd)
    //imagePreview.addEventListener("touchleave", touchEnd)
    
    function updateToolbarVisibility(event) {
        if (window.innerWidth < 700) {
            return
        }
       
        // handle touch events
        if (event.changedTouches !== undefined && event.changedTouches.length > 0) {
            // sample the events to mitigate noise caused by finger position on the screen
            sampling += 1
            if (sampling % 5 == 0) {
                yPos = -event.changedTouches[0].pageY
            }
            
            // adjust the preview-tools visibility
            scrollTop = yPos
            if (scrollTop > lastScrollTop) {
                hideToolbar()
            }
            else if (scrollTop < lastScrollTop) {
                showToolbar()
            }
            lastScrollTop = scrollTop
        }
        
        // handle wheel events
        if (event.deltaY !== undefined) {
            if (Math.sign(event.deltaY) < 0) {
                // wheel scrolling up
                showToolbar()
            }
            else
            {
                // wheel scrolling down
                hideToolbar()
            }
        }

        // handle keyboard events
        const KEYBOARD_UP = ['ArrowUp', 'Home', 'PageUp']
        const KEYBOARD_DOWN = ['ArrowDown', 'End', 'PageDown']
        if (KEYBOARD_UP.find(elem => elem == event.key) !== undefined) {
            // key up
            showToolbar()
        }
        else if (KEYBOARD_DOWN.find(elem => elem == event.key) !== undefined) {
            // key down
            hideToolbar()
        }
    }
    imagePreview.addEventListener("touchmove", updateToolbarVisibility)
    imagePreview.addEventListener("wheel", updateToolbarVisibility)
    imagePreview.addEventListener("keydown", updateToolbarVisibility) // arrow up/down, page up/down, home/end
    imagePreview.tabIndex = 0 // required to receive 'keydown' events on a DIV

    /* EDITOR AND PREVIEW PANE LAYOUT */
    // update preview pane size and position
    function updatePreviewSize(leftPosition) {
        if (window.innerWidth < 700) {
            return
        }

        // adjust the topnav placeholder's height
        hiddenHeader.style.height = topNavbar.offsetHeight + 'px'

        // resize the editor and preview panes as needed
        editorContainer.style.top = Math.max(-window.pageYOffset + tabContainer.offsetTop + tabContainer.offsetHeight, 0) + 'px'
        imagePreview.style.top = Math.max(-window.pageYOffset + tabContainer.offsetTop + tabContainer.offsetHeight, 0) + 'px'
        imagePreview.style.left = (typeof leftPosition == 'number' ? leftPosition : (editorContainer.offsetLeft + editorContainer.offsetWidth)) + 'px'
        // reposition the toggle container and button
        editorToggleContainer.style.top = editorContainer.style.top
        editorToggleContainer.style.bottom = '0px'
        //editorToggleButton.style.top = ((window.offsetHeight - editorToggleButton.offsetHeight) / 2) + 'px'
    };
    window.addEventListener("resize", updatePreviewSize)

    document.addEventListener("tabClick", (e) => {
        // update the body's overflow-y depending on the selected tab
        if (e.detail.name == 'main') {
            document.body.style.overflowY = 'hidden'
        }
        else
        {
            document.body.style.overflowY = 'auto'
        }
    })

    function observeResize(element, callbackFunction) {
        const resizeObserver = new ResizeObserver(callbackFunction)
        resizeObserver.observe(element, { box : 'border-box' })
    }
    observeResize(editorContainer, updatePreviewSize)
})()
