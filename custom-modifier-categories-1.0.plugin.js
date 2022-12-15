/*
    Custom Modifier Categories
    by Patrice

    Allows for multiple custom modifier categories. Use # to name your custom categories, e.g.:
    #Custom category 1
    Custom modifier 1
    Custom modifier 2
    ...    
    #Custom category 2
    Custom modifier n
    ...
    #Custom category n...
    ...
*/
(function() {
    PLUGINS['MODIFIERS_LOAD'] = []

    PLUGINS['MODIFIERS_LOAD'].push({
        loader: function() {
            const ID_PREFIX = 'custom-modifier-categories-plugin'
            
            var styleSheet = document.createElement("style")
            styleSheet.textContent = `
                .${ID_PREFIX}-separator {
                    border-bottom: 1px solid var(--background-color3);
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    margin-right: 15px;
                }
            `;
            document.head.appendChild(styleSheet)

            let customSection = false
            let customModifiers = localStorage.getItem(CUSTOM_MODIFIERS_KEY, '')
            customModifiersTextBox.value = customModifiers
            if (customModifiers !== null) {
                customModifiers = customModifiers.replace(/^\s*$(?:\r\n?|\n)/gm, "") // remove empty lines
            }
        
            if (Array.isArray(customModifiersGroupElement)) {
                customModifiersGroupElement.forEach(div => div.remove())
            }
            else
            {
                if (customModifiersGroupElement !== undefined) {
                    customModifiersGroupElement.remove()
                    customModifiersGroupElement = undefined
                }
            }
            customModifiersGroupElement = []
        
            if (customModifiers && customModifiers.trim() !== '') {
                customModifiers = customModifiers.split('\n')
                customModifiers = customModifiers.filter(m => m.trim() !== '')
                customModifiers = customModifiers.map(function(m) {
                    return {
                        "modifier": m
                    }
                })
                
                let category = 'Custom Modifiers'
                let modifiers = []
                Object.keys(customModifiers).reverse().forEach(item => {
                    if (customModifiers[item].modifier.substring(0, 1) === '#') { // new custom category
                        category = customModifiers[item].modifier.substring(1)
                        if (modifiers.length > 0) {
                            let customGroup = {
                                'category': category,
                                'modifiers': modifiers
                            }                
                    
                            const elem = createModifierGroup(customGroup, false)
                            customModifiersGroupElement.push(elem)
                            createCollapsibles(elem)
                        }
                        modifiers = []
                        category = '(Unnamed Section)'
                        customSection = true
                    } else {
                        modifiers.splice(0, 0, customModifiers[item])
                    }
                })
                if (modifiers.length > 0) {
                    let customGroup = {
                        'category': category,
                        'modifiers': modifiers
                    }                
            
                    const elem = createModifierGroup(customGroup, false)
                    customModifiersGroupElement.push(elem)
                    createCollapsibles(elem)
                }
                //if (customSection) {
                if (customModifiersGroupElement !== undefined) {
                    if (Array.isArray(customModifiersGroupElement)) {
                        customModifiersGroupElement[0].classList.add(`${ID_PREFIX}-separator`)
                    }
                    else
                    {
                        customModifiersGroupElement.classList.add(`${ID_PREFIX}-separator`)
                    }
                }
            }
            // collapse the first preset section
            let preset = editorModifierEntries.getElementsByClassName('collapsible active')[0]
            if (preset !==  undefined) {
                toggleCollapsible(preset.parentElement) // toggle first preset section
            }
        }
    })

    PLUGINS['MODIFIERS_LOAD'].forEach(fn=>fn.loader.call())
})()
