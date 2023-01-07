/*
    Image Editor Improvements
    by Patrice

    Image editor improvements:
    - Shows the actual brush in the image editor for increased precision.
    - Add img2img source image via drag & drop from external file or browser image (incl. rendered image). Just drop the image in the editor pane.
    - Add img2img source image by pasting an image from the clipboard
    - Integrates seamlessly with Scrolling Panes 1.8
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

    /* ADD SUPPORT FOR PASTING SOURCE IMAGE FROM CLIPBOARD */
    var imageObj = new Image()
    var canvas = document.createElement('canvas')
    var context = canvas.getContext('2d')

    imageObj.onload = function() {
        canvas.width = this.width
        canvas.height = this.height
        context.drawImage(imageObj, 0, 0)
        initImagePreview.src = canvas.toDataURL('image/png')
    };

	function handlePaste(e) {
	    for (var i = 0 ; i < e.clipboardData.items.length ; i++) {
	        var item = e.clipboardData.items[i]
	        if (item.type.indexOf("image") != -1) {
                imageObj.src = URL.createObjectURL(item.getAsFile())
	        }
	    }
	}
    document.addEventListener('paste', handlePaste)

    /* ADD SUPPORT FOR DRAG-AND-DROPPING SOURCE IMAGE (from file or straight from UI) */
    function handleDrop(e) {
        let items = []
    
        if (e?.dataTransfer?.items) { // Use DataTransferItemList interface
            items = Array.from(e.dataTransfer.items)
            items = items.filter(item => item.kind === 'file' && (item.type === 'image/png' || item.type === 'image/jpeg' || item.type === 'image/webp'))
            items = items.map(item => item.getAsFile())
        } else if (e?.dataTransfer?.files) { // Use DataTransfer interface
            items = Array.from(ev.dataTransfer.files)
        }
        if (items[0] !== undefined) {
            imageObj.src = URL.createObjectURL(items[0])
            e.preventDefault() // Prevent default behavior (Prevent file/content from being opened)
        }
    }
    document.querySelector('#editor').addEventListener("drop", handleDrop)
})()
