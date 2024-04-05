// styles/theme.js
import { createTheme } from '@mui/material/styles';

// Create a custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3', // Set your primary color
        },
        secondary: {
            main: '#f50057', // Set your secondary color
        },
        // You can also customize other palette options like error, warning, success, etc.
    },
    typography: {
        fontFamily: 'Roboto, sans-serif', // Set your preferred font family
        // You can also customize other typography options like fontSize, fontWeight, etc.
    },
    // You can add more customizations like spacing, breakpoints, shadows, etc.
});

export default theme;
