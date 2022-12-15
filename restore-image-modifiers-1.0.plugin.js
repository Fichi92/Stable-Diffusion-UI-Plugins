/*
    Restore Image Modifiers
    by Patrice

    Restores the image modifier cards upon reloading the page.
*/
(function () {
    "use strict"

    // save/restore the desired language
    window.addEventListener("beforeunload", function(e) {
        localStorage.setItem('image_modifiers', JSON.stringify(activeTags))
        return true
    })

    // reload the image modifiers
    let savedTags = JSON.parse(localStorage.getItem('image_modifiers'))
    let active_tags = savedTags == null ? [] : savedTags.map(x => x.name)
    // need tp wait for the modifiers to load for drag & drop to work properly
    setTimeout(() => {
        refreshModifiersState(active_tags)
        // update inactive tags
        const inactiveTags = savedTags.filter(tag => tag.inactive === true).map(x => x.name)
        if (inactiveTags.length > 0) {
            activeTags.forEach (tag => {
                if (inactiveTags.find(element => element === tag.name) !== undefined) {
                    tag.inactive = true
                }
            })
        }
        // update cards
        let overlays = document.querySelector('#editor-inputs-tags-list').querySelectorAll('.modifier-card-overlay')
        overlays.forEach (i => {
            let modifierName = i.parentElement.getElementsByClassName('modifier-card-label')[0].getElementsByTagName("p")[0].innerText
            if (inactiveTags.find(element => element === modifierName) !== undefined) {
                i.parentElement.classList.add('modifier-toggle-inactive')
            }
        })
    }, 500)
})()
