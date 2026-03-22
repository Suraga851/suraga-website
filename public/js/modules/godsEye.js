const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const resetEyeState = (container) => {
    container.style.setProperty("--eye-offset-x", "0px");
    container.style.setProperty("--eye-offset-y", "0px");
    container.style.setProperty("--eye-tilt-x", "0deg");
    container.style.setProperty("--eye-tilt-y", "0deg");
    container.style.setProperty("--eye-pupil-x", "0px");
    container.style.setProperty("--eye-pupil-y", "0px");
    container.style.setProperty("--eye-glint-x", "0px");
    container.style.setProperty("--eye-glint-y", "0px");
};

export const initGodsEye = () => {
    const heroImageContainer = document.querySelector(".hero-image-container");
    const godEye = heroImageContainer?.querySelector(".god-eye");
    if (!heroImageContainer || !godEye) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    let isTracking = false;
    let rafId = null;
    let queuedEvent = null;

    const applyTracking = (clientX, clientY) => {
        const bounds = heroImageContainer.getBoundingClientRect();
        if (bounds.width === 0 || bounds.height === 0) return;

        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const normalizedX = clamp((clientX - centerX) / (bounds.width / 2), -1, 1);
        const normalizedY = clamp((clientY - centerY) / (bounds.height / 2), -1, 1);

        heroImageContainer.style.setProperty("--eye-offset-x", `${(normalizedX * 9).toFixed(2)}px`);
        heroImageContainer.style.setProperty("--eye-offset-y", `${(normalizedY * 9).toFixed(2)}px`);
        heroImageContainer.style.setProperty("--eye-tilt-y", `${(normalizedX * 7).toFixed(2)}deg`);
        heroImageContainer.style.setProperty("--eye-tilt-x", `${(normalizedY * -7).toFixed(2)}deg`);
        heroImageContainer.style.setProperty("--eye-pupil-x", `${(normalizedX * 12).toFixed(2)}px`);
        heroImageContainer.style.setProperty("--eye-pupil-y", `${(normalizedY * 12).toFixed(2)}px`);
        heroImageContainer.style.setProperty("--eye-glint-x", `${(normalizedX * 16).toFixed(2)}px`);
        heroImageContainer.style.setProperty("--eye-glint-y", `${(normalizedY * 16).toFixed(2)}px`);
    };

    const queueTracking = (clientX, clientY) => {
        queuedEvent = { clientX, clientY };
        if (rafId !== null) return;

        rafId = window.requestAnimationFrame(() => {
            rafId = null;
            if (!queuedEvent) return;
            applyTracking(queuedEvent.clientX, queuedEvent.clientY);
            queuedEvent = null;
        });
    };

    const handlePointerMove = (event) => {
        queueTracking(event.clientX, event.clientY);
    };

    const stopTracking = () => {
        if (!isTracking) return;
        isTracking = false;

        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
        window.removeEventListener("blur", handlePointerLeave);
        document.removeEventListener("visibilitychange", handleVisibilityChange);

        if (rafId !== null) {
            window.cancelAnimationFrame(rafId);
            rafId = null;
        }
        queuedEvent = null;
        resetEyeState(heroImageContainer);
    };

    const startTracking = () => {
        if (isTracking) return;
        isTracking = true;

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
        window.addEventListener("blur", handlePointerLeave, { passive: true });
        document.addEventListener("visibilitychange", handleVisibilityChange);
    };

    const handlePointerLeave = () => {
        resetEyeState(heroImageContainer);
    };

    const handleVisibilityChange = () => {
        if (document.hidden) {
            resetEyeState(heroImageContainer);
        }
    };

    const updateMode = () => {
        const shouldBeStatic = prefersReducedMotion.matches || coarsePointer.matches;
        heroImageContainer.classList.toggle("god-eye-static", shouldBeStatic);

        if (shouldBeStatic) {
            stopTracking();
            return;
        }

        startTracking();
    };

    const subscribe = (query, listener) => {
        if ("addEventListener" in query) {
            query.addEventListener("change", listener);
            return () => query.removeEventListener("change", listener);
        }

        // Safari fallback
        query.addListener(listener);
        return () => query.removeListener(listener);
    };

    updateMode();
    const removeReducedMotionListener = subscribe(prefersReducedMotion, updateMode);
    const removePointerListener = subscribe(coarsePointer, updateMode);

    // Best-effort cleanup for page lifecycle transitions.
    window.addEventListener(
        "pagehide",
        () => {
            stopTracking();
            removeReducedMotionListener();
            removePointerListener();
        },
        { once: true }
    );
};
