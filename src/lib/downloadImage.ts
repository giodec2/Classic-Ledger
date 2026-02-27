import * as htmlToImage from 'html-to-image';

export const downloadAsImage = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const dataUrl = await htmlToImage.toPng(element, {
            quality: 0.95,
            backgroundColor: '#fdfbf7', // ivory color matching the background
            style: {
                transform: 'scale(1)',
            }
        });

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to download image', err);
    }
};
