import { useState, useEffect } from 'react';

export const useSidebar = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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