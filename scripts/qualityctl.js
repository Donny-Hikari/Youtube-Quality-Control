//
// Youtube Quality Control
// By Donny
// Donny (c) 2020
//
const $=document.querySelector.bind(document)
const LOG_PREFIX = "[Donny Youtube Quality Control] "
const LOG_LEVEL = 'debug'
const QUALITYCTRL_LABELS = ["Quality", "画質", "画质"]
const MUTED_LABELS = ["ミュート解除"]
const PLAYBACK_SPEED_LABELS = ["Playback speed", "再生速度"]
const NORMAL_SPEED_LABELS = ["Normal", "標準"]
const maxTrials4Quality = 100
const adSkipDelay = 1 // seconds, delay to avoid Youtube adBlocker blocker; < 0 disable auto ad skip

const storage = chrome.storage.sync

let previousTimeoutHandler = null
function hijackBubble(msg, timeout=3000) {
    try {
        let bezelText = $(".ytp-bezel-text-wrapper .ytp-bezel-text")
        if (bezelText != null) {
            bezelText.innerText = msg
            bezelText.parentElement.parentElement.style.display = 'block'
            clearTimeout(previousTimeoutHandler)
            previousTimeoutHandler = setTimeout(() => {
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

function isVisible(e) {
    return e != null && e.style.display != 'none';
}

function openSettingsMenu(open) {
    open = open ?? true;
    open = Boolean(open)

    let settingsMenu = $(".ytp-settings-menu")
    if (isVisible(settingsMenu) == open) {
        // already in the desired state
        return true
    }

    let settingsBtn = $(".ytp-button.ytp-settings-button")
    if (settingsBtn == null) {
        // settings button does not exist
        return false
    }

    settingsBtn.click()
    if (isVisible(settingsMenu) == open) {
        // now in the desired state
        return true
    }
    return false
}

function goBackSettingsMenu() {
    let backBtn = $(".ytp-settings-menu .ytp-panel-back-button")
    if (backBtn != null) {
        if (LOG_LEVEL == 'debug') {
            console.log(`${LOG_PREFIX}Go back settings menu`)
        }
        backBtn.click()
        return true
    } else {
        if (LOG_LEVEL == 'debug') {
            console.log(`${LOG_PREFIX}No back button for settings menu`)
        }
        return false
    }
}

function findSettingsMenuItem(name_candidates) {
    if (typeof(name_candidates) == "string") {
        name_candidates = [name_candidates]
    }

    goBackSettingsMenu() // try going back just in case

    let settingsMenu = $(".ytp-settings-menu")
    let menuItems = settingsMenu?.querySelectorAll('.ytp-menuitem')
    if (settingsMenu == null || menuItems == null || menuItems.length == 0) {
        if (LOG_LEVEL == 'debug') {
            console.log(`${LOG_PREFIX}activating settings menu`)
        }
        openSettingsMenu(true) // try activating the settings menu
        settingsMenu = $(".ytp-settings-menu")
        console.log(`${LOG_PREFIX}settings menu ${settingsMenu == null ? "is null" : "exists"}`)
        menuItems = settingsMenu?.querySelectorAll('.ytp-menuitem')
        if (settingsMenu == null) {
            if (LOG_LEVEL == 'debug') {
                console.log(`${LOG_PREFIX}does not work`)
            }
            return null
        } else {
            setTimeout(() => openSettingsMenu(false), 100)
        }
    }

    for (let child of menuItems) {
        let label = child.querySelector('.ytp-menuitem-label').textContent
        if (name_candidates.includes(label)) {
            return child
        }
    }
    return null
}


let startPlayingHandlers = []

let skipAd = true
let skippedAdsCount = 0
let skipAdsTimer = null
let isInAd = false
function skipAdCtl() {
    function getAdPreview() {
        return $(".ytp-preview-ad") || $(".ytp-ad-player-overlay-layout")
    }

    function getAdSkipBtn() {
        return $(".ytp-ad-skip-button.ytp-button") || $(".ytp-ad-skip-button-modern.ytp-button") || $(".ytp-skip-ad-button") || $(".ytp-ad-overlay-close-button")
    }

    function isAdPlaying() {
        let adPreview = getAdPreview()
        let adSkipBtn = getAdSkipBtn()
        return isVisible(adPreview) || isVisible(adSkipBtn)
    }

    // Evil Stuff
    // youtube now detect early skip; this is a trap!
    function skipAdWithBtn(skipBtn) {
        if (adSkipDelay > 0 && isVisible(skipBtn)) {
            setTimeout(() => skipBtn.click(), adSkipDelay*1000)
            skippedAdsCount += 1
            console.log(LOG_PREFIX + "Do some magic!" + (skippedAdsCount > 1 ? ` x${skippedAdsCount}` : ''))
            return true
        } else {
            return false
        }
    }

    function skipAdAuto() {
        return skipAdWithBtn(getAdSkipBtn())
    }

    function isMuted(muteBtn) {
        for (let label of MUTED_LABELS) {
            if (muteBtn.dataset['titleNoTooltip'].startsWith(label)) {
                return true;
            }
        }
        return false;
    }

    function muteAdThenSkip() {
        isInAd = isAdPlaying()
        if (isInAd && skipAdsTimer == null) {
            skippedAdsCount += 1
            console.log(LOG_PREFIX + "Doing some complex magic!" + (skippedAdsCount > 1 ? ` x${skippedAdsCount}` : ''))
            let muteBtn = $(".ytp-mute-button")
            if (!isMuted(muteBtn)) {
                muteBtn.click()
            }
            skipAdsTimer = setInterval(() => {
                let isInAd = isAdPlaying()
                let adSkipBtn = getAdSkipBtn()
                if (!isInAd) {
                    if (isMuted(muteBtn)) {
                        muteBtn.click()
                    }
                    clearInterval(skipAdsTimer)
                    skipAdsTimer = null
                    // skipAdCtl()
                } else if (isVisible(adSkipBtn)) {
                    skipAdAuto()
                }
            }, 100)
        }
    }

    if (skipAd) {
        muteAdThenSkip()
    }
}

let notPremium = true
let currentUpperLimit = 'best'
let nTries = 0
function qualityCtl() {
    const upperlimit = currentUpperLimit

    function retry(incRetry=true) {
        if (incRetry) {
            ++nTries
        }
        if (maxTrials4Quality <= 0 || nTries < maxTrials4Quality) {
            setTimeout(qualityCtl, 1000)
            return true
        } else {
            let info = `${LOG_PREFIX}Auto switch quality failed after ${nTries} attempts.`
            console.log(info)
            hijackBubble(info)
            return false
        }
    }

    if (isInAd) {
        retry(false)
        return false
    }

    let qualityMenu = findSettingsMenuItem(QUALITYCTRL_LABELS)
    if (!qualityMenu) {
        // settings menu does not exist, yet
        if (LOG_LEVEL == 'debug') {
            console.log(`${LOG_PREFIX}Quality menu not found`)
        }
        retry()
        return false
    }
    qualityMenu.click()

    let qualityItem = $(".ytp-quality-menu .ytp-menuitem:first-child")
    let success = false
    while (qualityItem != null) {
        let label = qualityItem.querySelector("span:first-child").firstChild.textContent
        if ((!notPremium || -1 == label.search("Premium")) && parseInt(label.split('p')[0]) <= upperlimit) {
            let switchedInfo = `${LOG_PREFIX}Quality switched to ${label}`

            qualityItem.click()
            console.log(switchedInfo)
            success = true

            hijackBubble(switchedInfo)

            break
        }
        qualityItem = qualityItem.nextSibling
    }
    if (!success && LOG_LEVEL == 'debug') {
        console.log(`${LOG_PREFIX}Quality level ${upperlimit} not found`)
    }

    setTimeout(() => {
        let handler_idx = -1
        function nextHandler() {
            handler_idx += 1
            if (handler_idx < startPlayingHandlers.length) {
                startPlayingHandlers[handler_idx](nextHandler)
            }
        }

        goBackSettingsMenu()
        nextHandler()
    }, 200)

    return success
}

function switchSpeed(speed, cb_done) {}

let currentSpeed = '1.0'
function speedCtl(nextHandler) {
    let speedMenu = findSettingsMenuItem(PLAYBACK_SPEED_LABELS)
    if (!speedMenu) {
        // settings menu does not exist
        if (LOG_LEVEL == 'debug') {
            console.log(`${LOG_PREFIX}Playback speed menu not found`)
        }
        return false
    }
    speedMenu.click()

    let speedItems = document.querySelectorAll(".ytp-settings-menu .ytp-panel-menu .ytp-menuitem")
    let targetItem = null
    let success = false
    for (let item of speedItems) {
        let label = item.firstChild.textContent
        if (currentSpeed != '1.0') {
            // not "normal" speed
            if (label == currentSpeed) {
                targetItem = item
                break
            }
        } else {
            // "normal" speed
            if (NORMAL_SPEED_LABELS.includes(label)) {
                targetItem = item
                break
            }
        }
    }

    if (targetItem != null) {
        let label = targetItem.firstChild.textContent
        let switchedInfo = `${LOG_PREFIX}Playback speed switched to ${label}`

        targetItem.click()
        console.log(switchedInfo)
        success = true
    } else {
        console.log(`${LOG_PREFIX}Playback speed ${currentSpeed} not found`)
    }

    setTimeout(() => {
        goBackSettingsMenu()
        nextHandler()
    }, 200)

    return success
}

function hookResetSpeed() {
    document.addEventListener("keydown", (event) => {
        if (event.key == '|') {
            console.log(`${LOG_PREFIX}Reset playback speed`)
            currentSpeed = '1.0'
            speedCtl(() => {})
        }
    })
}

let currentAddress = window.location.href
function addressChange(cb) {
    if (window.location.href != currentAddress) {
        console.log(`${LOG_PREFIX}Address changed, trying to do magic`)
        currentAddress = window.location.href
        nTries = 0
        cb()
    }
}

function mainCtl() {
    hookResetSpeed()
    qualityCtl()
    setInterval(() => addressChange(qualityCtl), 1000)

    if (skipAd) {
        setInterval(skipAdCtl, 400)
    }
}

storage.get(['quality','skipAd','swapColumns','notPremium','playbackSpeed'], function (d) {
    // load configs
    let currentQuality = d['quality'] ?? "best"
    currentUpperLimit = (currentQuality === 'best') ? Infinity : parseInt(currentQuality.split('p')[0])

    currentSpeed = d['playbackSpeed'] ?? '1.0'
    notPremium = d['notPremium'] ?? true
    skipAd = d['skipAd'] ?? true
    swapColumns = d['swapColumns'] ?? false

    startPlayingHandlers.push(speedCtl)

    if (swapColumns) {
        setTimeout(swapColumnsCtl, 1000)
    }

    mainCtl()
})
