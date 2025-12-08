import React from 'react';
import { Link } from 'react-router-dom';

// This component is exposed to the Host App (Portal)
// It renders the menu items for this module.
// Note: We use standard <a> tags or Links relative to the Portal Router if we share Router.
// Since we share 'react-router-dom', we can use <Link>.
// BUT: We need to be careful about paths. The Host might mount us at /app/generator.
// So we accept a `basePath` prop.

const ExposedMenu = ({ basePath = '', onItemClick }) => {
    // Helper to construct path
    const to = (path) => {
        // Remove trailing slash from base, remove leading slash from path
        const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
        const p = path.startsWith('/') ? path : '/' + path;
        return base + p;
    };

    return (
        <>
            <Link to={to('/properties')} onClick={onItemClick}>Nemovitosti</Link>
            <Link to={to('/generator')} onClick={onItemClick}>Generátor smluv</Link>
        </>
    );
};

export default ExposedMenu;
