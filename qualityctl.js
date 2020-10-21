//
// Youtube Quality Control
// By Donny
// Donny (c) 2020
// 
const $=document.querySelector.bind(document)

let swapColumns = false
function swapColumnsCtl() {
    if (swapColumns) {
        let columnsElem = $("#columns")
        if (columnsElem === null) {
            setTimeout(swapColumnsCtl, 100)
        } else {
            columnsElem.insertBefore($("#secondary"),$("#primary"))
        }
    }
}

let skipAd = true
let skippedAdsCount = 0
function skipAdCtl() {
    // Evil Stuff
    let adSkipBtn = $(".ytp-ad-skip-button.ytp-button")
    if (skipAd && adSkipBtn != null) {
        adSkipBtn.click()
        skippedAdsCount += 1
        console.log("[Donny Youtube Quality Control] Do some magic!" + (skippedAdsCount > 1 ? ` x${skippedAdsCount}` : ''))
    }

    let adCloseBtn = $(".ytp-ad-overlay-close-button")
    if (skipAd && adCloseBtn != null) {
        adCloseBtn.click()
        skippedAdsCount += 1
        console.log("[Donny Youtube Quality Control] Do some magic!" + (skippedAdsCount > 1 ? ` x${skippedAdsCount}` : ''))
    }
}

let currentUpperLimit = 'best'
function qualityCtl() {
    const upperlimit = currentUpperLimit

    skipAdCtl()

    let settingsBtn = $(".ytp-button.ytp-settings-button")
    if (settingsBtn == null) {
        setTimeout(qualityCtl, 1000)
        return
    }
    settingsBtn.click()

    let qualityMenu = $(".ytp-panel-menu .ytp-menuitem:last-child")
    if (qualityMenu == null || qualityMenu.querySelector(".ytp-menuitem-label").firstChild.textContent != "Quality") {
        settingsBtn.click()
        setTimeout(qualityCtl, 1000)
        return
    }
    qualityMenu.click()

    let qualityItem = $(".ytp-quality-menu .ytp-menuitem:first-child")
    let success = false
    while (qualityItem != null) {
        let label = qualityItem.querySelector("span:first-child").firstChild.textContent
        if (parseInt(label.split('p')[0]) <= upperlimit) {
            let switchedInfo = `[Donny Youtube Quality Control] Auto switched to ${label}`

            qualityItem.click()
            console.log(switchedInfo)
            success = true

            try {
                let bezelText = $(".ytp-bezel-text-wrapper .ytp-bezel-text")
                if (bezelText != null) {
                    bezelText.innerText = switchedInfo
                    bezelText.parentElement.parentElement.style.display = 'block'
                    setTimeout(() => {
                        bezelText.parentElement.parentElement.style.display = 'none'
                    }, 3000)
                }
            } catch (e) {}

            break
        }
        qualityItem = qualityItem.nextSibling
    }

    if (success != true) {
        // Leave auto
        settingsBtn.click()
    }

    if (skipAd) {
        setInterval(skipAdCtl, 1000)
    }
}

chrome.storage.sync.get(['quality','skipAd','swapColumns'], function (d) {
    let currentQuality = d['quality'] || "best"
    currentUpperLimit = (currentQuality === 'best') ? Infinity : parseInt(currentQuality.split('p')[0])

    skipAd = d['skipAd']
    if (skipAd === undefined) {
        skipAd = true
    }

    swapColumns = d['swapColumns']
    if (swapColumns === undefined) {
        swapColumns = false
    }
    if (swapColumns) {
        setTimeout(swapColumnsCtl, 1000)
    }

    qualityCtl()
})
