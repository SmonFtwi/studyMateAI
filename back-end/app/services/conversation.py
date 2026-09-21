import re


def conversational_reply(question: str) -> str | None:
    """Handle social messages only; mixed study questions must still use retrieval."""
    text = re.sub(r"[^\w\s']", " ", question.casefold()).strip()
    text = " ".join(text.split())
    greeting = r"(?:hi|hello|hey|good morning|good afternoon|good evening)(?: there| studymate)?"
    wellbeing = r"(?:how are you|how are you doing|how's it going)"
    if re.fullmatch(rf"(?:{greeting} )?{wellbeing}", text):
        return "I'm here and ready to help you study! What would you like to work on?"
    if re.fullmatch(greeting, text):
        return (
            "Hi! What would you like to study today? "
            "You can add sources to this project or ask a question about sources you've uploaded."
        )
    if re.fullmatch(r"(?:thanks|thank you|thanks a lot|thank you so much)(?: studymate)?", text):
        return "You're welcome! Let me know what you'd like to explore next."
    return None
