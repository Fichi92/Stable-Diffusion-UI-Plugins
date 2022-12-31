/*
    Image Editor Improvements
    by Patrice

    Shows the actual brush in the image editor for increased precision.
*/
(function() {
    "use strict"

    var styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .editor-canvas-overlay {
            cursor: none;
        }
     
        .image-brush-preview {
            position: fixed;
            background: black;
            opacity: 0.3;
            borderRadius: 50%;
            cursor: none;
            pointer-events: none;
            transform: translate(-50%, -50%);
        }
     
        /* the below fixes the left pane display and can be removed once https://github.com/cmdr2/stable-diffusion-ui/pull/737 is merged */
        .editor-options-container {
            max-width: unset;
        }

        .editor-controls-left {
            max-width: min-content;
        }
    `;
    document.head.appendChild(styleSheet);

    let imageBrushPreview
    let imageCanvas
    let canvasType
    let activeBrush

    function setupBrush() {
        // capture active brush
        activeBrush = document.querySelector(canvasType + ' .image_editor_brush_size .editor-options-container .active')

        // create a copy of the brush if needed
        if (imageBrushPreview == undefined) {
            // create brush to display on canvas
            imageBrushPreview = activeBrush.cloneNode(true)
            imageBrushPreview.className = 'image-brush-preview'
            imageBrushPreview.style.display = 'none'
            imageCanvas.parentElement.appendChild(imageBrushPreview)
        }

        // render the brush
        imageBrushPreview.style.width = activeBrush.offsetWidth + 'px'
        imageBrushPreview.style.height = activeBrush.offsetWidth + 'px'
        imageBrushPreview.style.display = 'block'
    }

    function cleanupBrush() {
        // delete the brush copy if the mouse moves out of the canvas
        imageCanvas.style.cursor = ''
        if (imageBrushPreview !== undefined) {
            imageBrushPreview.remove()
            imageBrushPreview = undefined
        }
    }

    function disableRightClick(e) {
        e.preventDefault()
    }

    function setupCanvas(canvas) {
        canvasType = canvas
        imageCanvas = document.querySelector(canvas + ' .editor-canvas-overlay')
        imageCanvas.addEventListener("contextmenu", disableRightClick)
        imageCanvas.addEventListener("mousemove", updateMouseCursor)
        imageCanvas.addEventListener("mouseenter", setupBrush)
        imageCanvas.addEventListener("mouseleave", cleanupBrush)
    }

    document.getElementById("init_image_button_draw").addEventListener("click", () => {
        setupCanvas('#image-editor')
    })

    document.getElementById("init_image_button_inpaint").addEventListener("click", () => {
        setupCanvas('#image-inpainter')
    })

    function updateMouseCursor(e) {
        // move the brush
        if (imageBrushPreview !== undefined) {
            imageBrushPreview.style.left = e.clientX + 'px'
            imageBrushPreview.style.top = e.clientY + 'px'
        }
    }
})()
