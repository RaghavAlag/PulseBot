document.addEventListener('DOMContentLoaded', function () {

    /* ================================================
       1. LIVE CLOCK
       Updates every second. Covers baked "10:30".
       ================================================ */

    var clockEl = document.getElementById('liveClock');

    function updateClock() {
        var now = new Date();
        var h = String(now.getHours()).padStart(2, '0');
        var m = String(now.getMinutes()).padStart(2, '0');
        if (clockEl) {
            clockEl.textContent = h + ':' + m;
        }
    }

    updateClock();
    setInterval(updateClock, 1000);


    /* ================================================
       2. ELEMENTS & HOVER STATE
       ================================================ */

    var container = document.getElementById('landingContainer');
    var sceneWrapper = document.getElementById('sceneWrapper');
    var mainMonitor = document.getElementById('mainMonitor');
    var monitorScreenDisplay = document.getElementById('monitorScreenDisplay');
    var zoomDarkness = document.getElementById('zoomDarkness');
    var pulsebotReveal = document.getElementById('pulsebotReveal');

    if (mainMonitor && container) {
        mainMonitor.addEventListener('mouseenter', function () {
            container.classList.add('monitor-hovered');
        });

        mainMonitor.addEventListener('mouseleave', function () {
            container.classList.remove('monitor-hovered');
        });
    }


    /* ================================================
       3. WRONG-CLICK DISCOVERY SYSTEM ("ACCESS DENIED")
       ================================================ */

    var isZooming = false;
    var accessDeniedTimer = null;

    function triggerAccessDenied() {
        if (isZooming) return;

        // Reset any existing timer smoothly
        if (accessDeniedTimer) {
            clearTimeout(accessDeniedTimer);
            accessDeniedTimer = null;
        }

        // Show ACCESS DENIED inside the physical main monitor
        if (container) container.classList.add('access-denied');
        if (monitorScreenDisplay) monitorScreenDisplay.classList.add('active');

        // Automatically fade back to normal monitor state after 1.5 seconds
        accessDeniedTimer = setTimeout(function () {
            if (container) container.classList.remove('access-denied');
            if (monitorScreenDisplay) monitorScreenDisplay.classList.remove('active');
            accessDeniedTimer = null;
        }, 1500);
    }

    // Capture clicks anywhere on the landing page
    document.addEventListener('click', function (e) {
        if (isZooming) return;

        // Ignore clicks inside the main interactive monitor or reveal modal
        if (mainMonitor && mainMonitor.contains(e.target)) {
            return;
        }
        if (pulsebotReveal && pulsebotReveal.contains(e.target)) {
            return;
        }

        // Any other click (background, desk, character, robot, secondary monitor, clock, etc.)
        triggerAccessDenied();
    });


    /* ================================================
       4. MAIN MONITOR — CINEMATIC ZOOM
       ================================================ */

    if (mainMonitor) {
        mainMonitor.addEventListener('click', function (e) {
            e.stopPropagation();

            if (isZooming) return;
            isZooming = true;

            // Clear any active access denied display immediately
            if (accessDeniedTimer) {
                clearTimeout(accessDeniedTimer);
                accessDeniedTimer = null;
            }
            if (container) container.classList.remove('access-denied');
            if (monitorScreenDisplay) monitorScreenDisplay.classList.remove('active');

            // Measure positions at click time to calculate required zoom scale
            var wrapperRect = sceneWrapper.getBoundingClientRect();
            var monitorRect = mainMonitor.getBoundingClientRect();

            // Monitor center relative to the scene wrapper (used for transform-origin)
            var monitorCenterX = (monitorRect.left - wrapperRect.left) + (monitorRect.width / 2);
            var monitorCenterY = (monitorRect.top - wrapperRect.top) + (monitorRect.height / 2);

            // Transform-origin as percentage of wrapper dimensions
            var originX = (monitorCenterX / wrapperRect.width) * 100;
            var originY = (monitorCenterY / wrapperRect.height) * 100;

            // Calculate how much we need to scale the wrapper so the monitor fills the viewport
            var scaleX = window.innerWidth / monitorRect.width;
            var scaleY = window.innerHeight / monitorRect.height;
            var scale = Math.max(scaleX, scaleY) * 1.15; // 1.15 multiplier for slight overshoot

            // Apply computed transform to the wrapper
            sceneWrapper.style.transformOrigin = originX + '% ' + originY + '%';
            sceneWrapper.style.transform = 'scale(' + scale + ')';

            // Clean up hover state and start zoom transition
            container.classList.remove('monitor-hovered');
            container.classList.add('zooming');

            // Darkness fades in partway through the zoom
            setTimeout(function () {
                if (zoomDarkness) zoomDarkness.classList.add('active');
            }, 600);

            // PulseBot reveal after zoom + darkness peak
            setTimeout(function () {
                if (pulsebotReveal) pulsebotReveal.classList.add('active');
            }, 1550);
        });
    }

});