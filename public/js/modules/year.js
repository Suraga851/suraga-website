export const setCurrentYear = () => {
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear().toString();
    }
};
