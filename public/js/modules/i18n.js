export const getMessages = (isRtl) => {
    if (isRtl) {
        return {
            sending: "جارٍ الإرسال...",
            success: "شكراً! تم إرسال رسالتك بنجاح.",
            error: "حدث خطأ. يرجى إعادة المحاولة أو التواصل عبر واتساب.",
            docUnavailable: "هذا المستند غير متاح حالياً.",
            defaultDocTitle: "مستند",
            subjectPrefix: "رسالة",
            from: "من",
            openDocLabel: (title) => `فتح مستند: ${title}`
        };
    }

    return {
        sending: "Sending...",
        success: "Thank you! Your message has been sent successfully.",
        error: "Something went wrong. Please try again or contact me directly via WhatsApp.",
        docUnavailable: "This document is currently unavailable.",
        defaultDocTitle: "Document",
        subjectPrefix: "New",
        from: "from",
        openDocLabel: (title) => `Open document: ${title}`
    };
};
