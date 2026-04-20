import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const initCapacitorHooks = async () => {
    // Only execute if running inside Capacitor native bridge
    if (!window?.Capacitor?.isNative) {
        return;
    }

    try {
        // Hide splash screen smoothly after DOM loads
        await SplashScreen.hide();

        // Style the hardware status bar
        await StatusBar.setStyle({ style: Style.Dark });
        if (window.Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: '#0f766e' });
        }

        // Attach haptic feedback to buttons
        const attachHaptics = () => {
            const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .lang-switch-btn, .mobile-menu-toggle');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    Haptics.impact({ style: ImpactStyle.Light }).catch(console.error);
                });
            });
        };

        // Attach immediately and observe for future dynamic buttons
        attachHaptics();
        const observer = new MutationObserver((mutations) => {
            let shouldReattach = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    shouldReattach = true;
                    break;
                }
            }
            if (shouldReattach) attachHaptics();
        });
        
        observer.observe(document.body, { childList: true, subtree: true });

    } catch (e) {
        console.error('Capacitor Error:', e);
    }
};
