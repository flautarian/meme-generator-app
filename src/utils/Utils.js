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
            "Courier",
            "Comic Sans MS",
        ]
    },
    requestClipboardPermission: async () => {
        try {
            const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' });
            if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
                // Permission granted or prompted
                return true;
            } else {
                // Permission denied
                console.error('Clipboard permission denied');
                return false;
            }
        } catch (error) {
            console.error('Error requesting clipboard permission:', error);
            return false;
        }
    },
    getBrowserName: () => {
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Firefox")) {
            // "Mozilla/5.0 (X11; Linux i686; rv:104.0) Gecko/20100101 Firefox/104.0"
            return "Mozilla Firefox";
        } else if (userAgent.includes("SamsungBrowser")) {
            // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36"
            return "Samsung Internet";
        } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
            // "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 OPR/90.0.4480.54"
            return "Opera";
        } else if (userAgent.includes("Edge")) {
            // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
            return "Microsoft Edge (Legacy)";
        } else if (userAgent.includes("Edg")) {
            // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 Edg/104.0.1293.70"
            return "Microsoft Edge (Chromium)";
        } else if (userAgent.includes("Chrome")) {
            // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
            return "Google Chrome or Chromium";
        } else if (userAgent.includes("Safari")) {
            // "Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1"
            return "Apple Safari";
        } else {
            return "unknown";
        }
    }


}
