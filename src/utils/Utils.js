import initMemeDecorations from "./initMemeDecorations";
import InitMemes from "./InitMemes";
import documentUploadOption from "./documentUploadOption";
import initSettings from "./initSettings";

export const Utils = {
    getRandomInt: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    getInitMemes: () => {
        return InitMemes;
    },
    getInitMemeDecorations: () => {
        return initMemeDecorations;
    },
    getInitSettings: () => {
        return initSettings;
    },
    getDocumentUploadOption: () => {
        return documentUploadOption;
    },
    checkIfImgLoadedFromUser: (str) => {
        if (!str || typeof str !== "string")
            return false;
        return str.startsWith("data:image");
    },
    convertBase64ToImage: async (base64String) => {
        try {
            // Convert Base64 string to a Blob
            const byteCharacters = atob(base64String.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });

            // Create a ClipboardItem and write it to the clipboard
            return new ClipboardItem({ 'image/png': blob });
        } catch (error) {
            Alert.alert('Error', 'Failed to convert Base64 to image.');
            console.error(error);
        }
    },
    getBackgroundTypesList: () => {
        return [
            "lava",
            "gradient",
            "none",
        ]
    },
    getResizeModesList: () => {
        return [
            "4-squares",
            "1-square",
        ]
    },
    getFontTypesList: () => {
        return [
            "Impact",
            "Arial",
        ]
    }

}
