/*
    Reload Models
    by Patrice

    Adds a button to reload models without having to refresh the page.
*/
(function() {
    "use strict"

    var styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .reloadModels {
            background: var(--background-color2);
            border: none;
        }
        
        #reloadModel.secondaryButton:hover {
            background: var(--background-color2);
        }
    `;
    document.head.appendChild(styleSheet);

    // empty models
    function removeOptions(selectElement) {
        if (selectElement !== undefined) {
            let i, L = selectElement.options.length - 1
            for(i = L; i >= 0; i--) {
                selectElement.remove(i)
            }
        }
    }

    // reload models button
    const reloadModelIcon = document.createElement('button')
    reloadModelIcon.id = 'reloadModel'
    reloadModelIcon.className = 'secondaryButton reloadModels'
    reloadModelIcon.addEventListener('click', (event) => {
        removeOptions(stableDiffusionModelField)
        removeOptions(vaeModelField)
        removeOptions(hypernetworkModelField)
        getModels()
    })
    reloadModelIcon.innerHTML = "<i class='fa-solid fa-rotate'></i>"
    stableDiffusionModelField.parentNode.insertBefore(reloadModelIcon, stableDiffusionModelField.nextSibling)
})()
