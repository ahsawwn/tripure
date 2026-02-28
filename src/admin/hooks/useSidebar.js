import { useState, useEffect } from 'react';

export const useSidebar = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsExpanded(false);
                setIsMobileOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setIsExpanded(!isExpanded);
        }
    };

    const closeSidebar = () => {
        if (isMobile) {
            setIsMobileOpen(false);
        }
    };

    return {
        isExpanded,
        isMobile,
        isMobileOpen,
        toggleSidebar,
        closeSidebar
    };
};