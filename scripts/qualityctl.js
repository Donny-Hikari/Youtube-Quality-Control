//
// Youtube Quality Control
// By Donny
// Donny (c) 2020
// 
const $=document.querySelector.bind(document)
const LOG_PREFIX = "[Donny Youtube Quality Control] "
const QUALITYCTRL_LABELS = ["Quality", "画質", "画质"]
const maxTrials4Quality = 20

const storage = chrome.storage.sync

function hijackBubble(msg, timeout=3000) {
    try {
        let bezelText = $(".ytp-bezel-text-wrapper .ytp-bezel-text")
        if (bezelText != null) {
            bezelText.innerText = msg
            bezelText.parentElement.parentElement.style.display = 'block'
            setTimeout(() => {
                bezelText.parentElement.parentElement.style.display = 'none'
            }, timeout)
        }
    } catch (e) {}
}

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
let skipAdsTimer = null
function skipAdCtl() {
    // Evil Stuff
    let adSkipBtn = $(".ytp-ad-skip-button.ytp-button")
    if (adSkipBtn == null) {
        adSkipBtn = $(".ytp-ad-skip-button-modern.ytp-button")
    }
    if (skipAd && adSkipBtn != null) {
        adSkipBtn.click()
        skippedAdsCount += 1
        console.log(LOG_PREFIX + "Do some magic!" + (skippedAdsCount > 1 ? ` x${skippedAdsCount}` : ''))
    }

    let adCloseBtn = $(".ytp-ad-overlay-close-button")
    if (skipAd && adCloseBtn != null) {
        adCloseBtn.click()
        skippedAdsCount += 1
        console.log(LOG_PREFIX + "Do some magic!" + (skippedAdsCount > 1 ? ` x${skippedAdsCount}` : ''))
    } else {
        // Some Ads can not be skipped
        let adPreview = $(".ytp-ad-preview-container")
        if (skipAd && adPreview != null && skipAdsTimer == null) {
            skippedAdsCount += 1
            console.log(LOG_PREFIX + "Doing some complex magic!" + (skippedAdsCount > 1 ? ` x${skippedAdsCount}` : ''))
            let muteBtn = $(".ytp-mute-button")
            muteBtn.click()
            skipAdsTimer = setInterval(() => {
                let adPreview = $(".ytp-ad-preview-container")
                if (adPreview == null) {
                    muteBtn.click()
                    clearInterval(skipAdsTimer)
                    skipAdsTimer = null
                }
            }, 100)
        }
    }
}

let notPremium = true
let currentUpperLimit = 'best'
function qualityCtl() {
    const upperlimit = currentUpperLimit

    let settingsBtn = $(".ytp-button.ytp-settings-button")
    if (settingsBtn == null) {
        return false
    }
    settingsBtn.click()

    let qualityMenu = $(".ytp-panel-menu .ytp-menuitem:last-child")
    if (qualityMenu == null || !QUALITYCTRL_LABELS.includes(qualityMenu.querySelector(".ytp-menuitem-label").firstChild.textContent)) {
        settingsBtn.click()
        return false
    }
    qualityMenu.click()

    let qualityItem = $(".ytp-quality-menu .ytp-menuitem:first-child")
    let success = false
    while (qualityItem != null) {
        let label = qualityItem.querySelector("span:first-child").firstChild.textContent
        if ((!notPremium || -1 == label.search("Premium")) && parseInt(label.split('p')[0]) <= upperlimit) {
            let switchedInfo = `${LOG_PREFIX}Auto switched to ${label}`

            qualityItem.click()
            console.log(switchedInfo)
            success = true

            hijackBubble(switchedInfo)

            break
        }
        qualityItem = qualityItem.nextSibling
    }

    if (success != true) {
        // Leave auto
        settingsBtn.click()
    }

    return true
}

let currentAddress = window.location.href
function addressChange(cb) {
    if (window.location.href != currentAddress) {
        currentAddress = window.location.href
        cb()
    }
}

let nTries = 0
function mainCtl() {
    function retry() {
        ++nTries
        if (maxTrials4Quality <= 0 || nTries < maxTrials4Quality) {
            setTimeout(mainCtl, 1000)
            return true
        } else {
            let info = `${LOG_PREFIX}Auto switch quality failed after ${nTries} attempts.`
            console.log(info)
            hijackBubble(info)
            return false
        }
    }

    skipAdCtl()
    if (!qualityCtl()) {
        if (retry()) {
            return
        }
    }

    if (skipAd) {
        setInterval(skipAdCtl, 1000)
    }
    setInterval(() => addressChange(qualityCtl), 1000)
}

storage.get(['quality','skipAd','swapColumns'], function (d) {
    let currentQuality = d['quality'] || "best"
    currentUpperLimit = (currentQuality === 'best') ? Infinity : parseInt(currentQuality.split('p')[0])

    notPremium = d['notPremium'] ?? true
    skipAd = d['skipAd'] ?? true
    swapColumns = d['swapColumns'] ?? false

    if (swapColumns) {
        setTimeout(swapColumnsCtl, 1000)
    }

    mainCtl()
})
