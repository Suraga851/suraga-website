import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-XXXXXXXXXX"; // Placeholder

export const initGA = () => {
    ReactGA.initialize(MEASUREMENT_ID);
    // Send initial pageview
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const trackSectionView = (sectionName: string) => {
    ReactGA.event({
        category: "Section",
        action: "View",
        label: sectionName,
    });
};
