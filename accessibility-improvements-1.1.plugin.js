/*
    Accessibility Improvements
    by Patrice

    Adds a system setting to allow the user to change the action to display the buttons on an image (rather than just hovering over it). Default is set to hover (current UI behavior), can be changed to use mouse buttons in the system settings.
    Also adds an option to disable the right-click contextual menu on most elements of the page (still allowed in input and text boxes)
*/
(function() {
    "use strict"

    /* inject new settings in the existing system settings popup table */
    let settings = [
        {
            id: "disable_right_click",
            type: ParameterType.checkbox,
            label: "Disable right-click",
            note: "Disables the browser's contextual menu on right-click (does not apply to image contextual menu).",
            default: false,
            icon: "fa-computer-mouse"
        },
        {
            id: "contextual_menu_invocation",
            type: ParameterType.select,
            label: "How to show action buttons on images",
            note: "Choose how to invoke the action buttons on images.",
            default: "hover",
            options: [
                {
                    value: "hover",
                    label: "Hover (default)"
                },
                {
                    value: "left_click",
                    label: "Left-click"
                },
                {
                    value: "middle_click",
                    label: "Middle-click"
                },
                {
                    value: "right_click",
                    label: "Right-click"
                },
                {
                    value: "ctrl_left_click",
                    label: "Ctrl + Left-click"
                },
                {
                    value: "ctrl_middle_click",
                    label: "Ctrl + Middle-click"
                },
                {
                    value: "ctrl_right_click",
                    label: "Ctrl + Right-click"
                }
            ],
            icon: "fa-list"
        }
    ];

    function injectParameters(parameters) {
        parameters.forEach(parameter => {
            var element = getParameterElement(parameter)
            var note = parameter.note ? `<small>${parameter.note}</small>` : "";
            var icon = parameter.icon ? `<i class="fa ${parameter.icon}"></i>` : "";
            var newRow = document.createElement('div')
            newRow.innerHTML = `
                <div>${icon}</div>
                <div><label for="${parameter.id}">${parameter.label}</label>${note}</div>
                <div>${element}</div>`
            //parametersTable.appendChild(newRow)
            parametersTable.insertBefore(newRow, parametersTable.children[13])
            parameter.settingsEntry = newRow
        })
    }
    injectParameters(settings)
    let contextualMenuInvocation = document.querySelector("#contextual_menu_invocation")
    let disableRightClick = document.querySelector("#disable_right_click")

    // image context menu
    contextualMenuInvocation.addEventListener('change', (e) => {
        localStorage.setItem('contextual_menu_invocation', contextualMenuInvocation.value)
        updateContextualMenuOnHover()
    })
    contextualMenuInvocation.value = localStorage.getItem('contextual_menu_invocation') == null ? 'hover' : localStorage.getItem('contextual_menu_invocation')
    updateContextualMenuOnHover()
    // disable right click
    disableRightClick.addEventListener('change', (e) => {
        localStorage.setItem('disable_right_click', disableRightClick.checked)
    })
    disableRightClick.checked = localStorage.getItem('disable_right_click') == null ? false : localStorage.getItem('disable_right_click')

    const invokeContextMenu = {
        hover: { key: null, modifier: null},
        left_click: {key: 0, ctrl: false},
        middle_click: {key: 1, ctrl: false},
        right_click: {key: 2, ctrl: false},
        ctrl_left_click: {key: 0, ctrl: true},
        ctrl_middle_click: {key: 1, ctrl: true},
        ctrl_right_click: {key: 2, ctrl: true}
    }
        
    /* Mouse events */
    // disable context menu as needed
    window.addEventListener('contextmenu', (event) => {
        const ALLOW_RIGHT_CLICK = ['TEXTAREA', 'INPUT']
        if ((disableRightClick.checked && ALLOW_RIGHT_CLICK.find(elem => elem == event.target.nodeName) == undefined) || clickedOnImage(event)) {
            event.preventDefault()
        }
    })

    let contextMenu = undefined
    let prevContextMenu = undefined
    window.addEventListener('mouseup', (event) => {
        let clickedImage = undefined
        
        clickedImage = clickedOnImage(event)
        if (clickedImage !== undefined) {
            event.preventDefault()
            contextMenu = clickedImage.parentNode.querySelector('.imgItemInfo')
            if (contextMenu !==  null) {
                if (contextMenu.style.display == 'flex') {
                    hideImageContextMenu(prevContextMenu)
                }
                else
                {
                    hideImageContextMenu(prevContextMenu)
                    contextMenu.style.display =  'flex'
                    prevContextMenu = contextMenu
                }
            }
        } else if (contextualMenuInvocation.value !== 'hover') {
            // hide contextual menu
            hideImageContextMenu(prevContextMenu)
        }
    })

    // did user click on an image?
    function clickedOnImage(event) {
        if (event.button == invokeContextMenu[contextualMenuInvocation.value].key && event.ctrlKey == invokeContextMenu[contextualMenuInvocation.value].ctrl) {
            // show contextual menu as needed
            const clickedElem = document.elementFromPoint(event.clientX, event.clientY)
            if (clickedElem !== null) {
                const clickedImage = clickedElem.closest(".imgContainer")
                if (clickedImage !== null) {
                    return clickedImage
                }
            }
        }
        return undefined
    }

    // hide the menu as applicable
    function hideImageContextMenu(contextMenu) {
        if (contextMenu !== undefined) {
            contextMenu.style.display = 'none'
        }
    }

    // change the stylesheet on the fly
    function updateContextualMenuOnHover() {
        let hoverEnabled = contextualMenuInvocation.value == 'hover'
        
        // Getting the stylesheet
        const stylesheet = document.styleSheets[2]
        let elementRules
        
        // looping through all its rules and getting your rule
        for (let i = 0; i < stylesheet.cssRules.length; i++) {
            if(stylesheet.cssRules[i].selectorText === '.imgItemInfo') {
                elementRules = stylesheet.cssRules[i]
                
                // modifying the rule in the stylesheet
                elementRules.style.setProperty('display', hoverEnabled ? 'flex' : 'none')
                elementRules.style.setProperty('opacity', hoverEnabled ? 0 : 1)
                break;
            }
        }
    }
})()
