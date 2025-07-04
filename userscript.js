// ==UserScript==
// @name         GeoFS-cockpit-volume
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Lowers the volume when in cockpit view in aircraft without dedicated cockpit sounds
// @author       geofspilot
// @match        https://www.geo-fs.com/geofs.php?v=*
// @match        https://*.geo-fs.com/geofs.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==
const exemptAircraft = new Set([]);
let savedVolume = null; 
let wasCockpit = false;
let volumeReduction = 0.5;

setInterval(() => {
    const currentId = Number(geofs.aircraft.instance.id);
    const isExempt = exemptAircraft.has(currentId);
    const currentVolume = geofs.preferences.volume;
    const cameraMode = geofs.animation.values.cameraMode;

    if (isExempt) {
        // reset the volume if we switch from cockpit view in a non-exempt aircraft to an exempt aircraft
        if (wasCockpit && savedVolume !== null) {
            geofs.preferences.volume = savedVolume;
            console.log(`switched to exempt aircraft, volume restored to ${savedVolume}`);
            wasCockpit = false;
            savedVolume = null;
        }
        return;
    }

if (cameraMode.toLowerCase().includes("wing") || ) {
        if (!wasCockpit) {
            savedVolume = geofs.preferences.volume;
            geofs.preferences.volume = savedVolume * volumeReduction;
            console.log(`switched to wing cam, volume set to ${geofs.preferences.volume}`);
            wasCockpit = true;
        } else {
            const targetVolume = savedVolume * volumeReduction;
            const volumeTolerance = 0.01; // allow tiny float differences

            if (Math.abs(currentVolume - targetVolume) > volumeTolerance) {
                savedVolume = currentVolume / volumeReduction; //reverse-calculate what the exterior volume should be based on the new cockpit volume
            }
        }
    } else {
        if (wasCockpit && savedVolume !== null) {
            geofs.preferences.volume = savedVolume;
            console.log(`Exited wing view, volume restored to ${savedVolume}`);
            wasCockpit = false;
            savedVolume = null;
        }
    }
}, 300);

window.addEventListener("beforeunload", () => {
    if (wasCockpit) {
        geofs.preferences.volume = savedVolume || 1;
    }
});

